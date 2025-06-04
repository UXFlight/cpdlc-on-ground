from app.state import pilot_state
from app.ingsvc import Echo
from app.utils.constants import ACTION_DEFINITIONS
from app.services import log_json, cancel_timer
from app.utils.constants import MSG_STATUS

agent = Echo()

def process_action(action_name: str, request_type: str | None):
    config = ACTION_DEFINITIONS.get(action_name)
    if not config:
        return {"error": f"Unknown action: {action_name}"}

    if config.get("requiredType"):
        if not request_type or request_type not in config["allowedTypes"]:
            return {"error": f"Invalid or missing requestType for '{action_name}'"}

    request_type = config.get("fixedType", request_type)
    message = config["message"](request_type)

    agent.set_action(action_name, True)
    pilot_state.update_step(request_type, config["status"], message)

    # if action_name in [MSG_STATUS.WILCO, MSG_STATUS.STANDBY, MSG_STATUS.UNABLE]:
    #     cancel_timer(request_type)
    #     pilot_state.steps[request_type]["timeLeft"] = None 

    log_json("ACTION", {
        "action": action_name,
        "requestType": request_type,
        "status": config["status"],
        "message": message
    })

    return {
        "status": config["status"],
        "message": message,
        "requestType": request_type,
        "timestamp": pilot_state.steps[request_type]["timestamp"]
    }
