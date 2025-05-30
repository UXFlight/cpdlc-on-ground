# app/routes/request_routes.py
from flask import Blueprint, jsonify # type: ignore
from app.ingsvc import Echo
from app.state import pilot_state
from app.constants import DEFAULT_ATC_RESPONSES
from app.socket.sockets import socket_manager
import threading

request_bp = Blueprint("request", __name__)
agent = Echo()

def delayed_socket_emit(action):
    from app.constants import DEFAULT_ATC_RESPONSES
    socket_manager.send_message(DEFAULT_ATC_RESPONSES[action])

#! for now, faking http req to ATC, after opting for async (with websockets)
@request_bp.route("/request/<action>", methods=["GET"])
def request_action(action):
    agent.set_request(action, True)
    pilot_state.update_step(action, "requested", "Sent to ATC")

    step = pilot_state.steps.get(action)
    response = {
        "status": step["status"],
        "message": step["message"],
        "timestamp": step["timestamp"],
        "new_history_entry": step["history"][-1] if step["history"] else None
    }

    print(f"[REQUEST] Action requested: {action}")
    threading.Timer(5.0, delayed_socket_emit, args=[action]).start() #! simulates ATC response delay
    print(f"[REQUEST] Action response sent: {action}")
    return jsonify(response)
