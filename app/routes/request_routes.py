from flask import Blueprint, jsonify # type: ignore
from app.services.request_service import process_request, simulate_atc_response, cancel_request, get_state
from app.socket.sockets import socket_manager
import threading
import random

request_bp = Blueprint("request", __name__)

@request_bp.route("/request/<action>", methods=["GET"])
def request_action(action):
    """
    Requête envoyée par le pilote (ex: 'engine_startup').
    Le backend retourne immédiatement une réponse de confirmation,
    et émet plus tard une réponse ATC simulée par WebSocket.
    """
    response = process_request(action)
    delay = random.uniform(2.0, 6.0) # ATC délay between 2 and 6 seconds
    threading.Timer(delay, simulate_atc_response, args=[action, socket_manager]).start()
    return jsonify(response)

@request_bp.route("/cancel-request/<action>", methods=["POST"])
def handle_cancel_request(action):
    result = cancel_request(action)
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result)

@request_bp.route("/state", methods=["GET"])
def get_state():
    return jsonify(get_state())
