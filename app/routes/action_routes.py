# app/routes/action_routes.py

from flask import Blueprint, request, jsonify
from app.ingsvc import Echo
from app.state import pilot_state
from app.constants import ACTION_OUTPUTS, DEFAULT_ATC_RESPONSES, TAXI_CLEARANCE_MESSAGE

action_bp = Blueprint("action", __name__)
agent = Echo()

@action_bp.route("/action/<button>", methods=["POST"])
def handle_button(button):
    if button not in ACTION_OUTPUTS:
        return jsonify({"error": "Invalid button"}), 400

    agent.set_action(button, True)
    pilot_state.update_step(button, "acknowledged", f"{button.upper()} received")
    return jsonify({"status": "acknowledged", "button": button})

@action_bp.route("/execute", methods=["POST"])
def execute():
    data = request.get_json()
    print(data)
    agent.set_action("execute", True) #! solid lines on AMM
    pilot_state.update_step(data["requestType"] ,"executed")
    return jsonify({"status": "executed", "message": TAXI_CLEARANCE_MESSAGE})

@action_bp.route("/load", methods=["POST"]) #! /action/<action>
def load_action():
    data = request.get_json()
    agent.set_action("load", True) #! dashed lines on AMM
    pilot_state.update_step(data["requestType"], "loaded")
    print(data["requestType"])
    return jsonify({"status": "loaded", "message": DEFAULT_ATC_RESPONSES[data["requestType"]]})

@action_bp.route("/cancel", methods=["POST"])
def cancel():
    agent.set_action("Cancel", True)
    pilot_state.update_step("taxi_clearance", "cancelled")
    return jsonify({"status": "cancelled"})
