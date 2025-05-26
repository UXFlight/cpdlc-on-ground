# app/routes/request_routes.py

from flask import Blueprint, jsonify
from datetime import datetime
from app.ingsvc import Echo
from app.state import pilot_state

request_bp = Blueprint("request", __name__)
agent = Echo()

@request_bp.route("/request/<action>", methods=["GET"])
def request_action(action):
    # Logique réduite à l’essentiel pour le moment
    agent.set_request(action, True)
    pilot_state.update_step(action, "requested", "Sent to ATC")
    return jsonify({"status": "requested", "action": action, "timestamp": datetime.now().strftime("%H:%M:%S")})
