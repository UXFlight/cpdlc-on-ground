# app/routes/request_routes.py
from flask import Blueprint, jsonify
from datetime import datetime
from app.ingsvc import Echo
from app.state import pilot_state

request_bp = Blueprint("request", __name__)
agent = Echo()

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
    return jsonify(response)
