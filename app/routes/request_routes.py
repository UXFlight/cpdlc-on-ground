from flask import Blueprint, jsonify # type: ignore
from app.services.request_service import process_request, simulate_atc_response, cancel_request, get_state_service
from app.socket.sockets import socket_manager
import threading
import random

request_bp = Blueprint("request", __name__)

@request_bp.route("/request/<request_type>", methods=["GET"])
def request_action(request_type):
    response = process_request(request_type)
    delay = random.uniform(2.0, 6.0) # ATC délay between 2 and 6 seconds
    threading.Timer(delay, simulate_atc_response, args=[request_type, socket_manager]).start()
    return jsonify(response)

@request_bp.route("/cancel-request/<request_type>", methods=["POST"])
def handle_cancel_request(request_type):
    result = cancel_request(request_type)
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result)

@request_bp.route("/state", methods=["GET"])
def get_state():
    return jsonify(get_state_service())
