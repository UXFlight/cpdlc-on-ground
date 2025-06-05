
from app.classes.state.state import PilotState
from app.classes.ingsvc.agent import Echo
from app.classes.log import log_manager
from app.utils.constants import ACTION_DEFINITIONS
from app.utils.time_utils import get_current_timestamp

class Pilot:
    def __init__(self, sid):
        self.sid = sid
        self.state = PilotState()
        self.agent = Echo(sid)
        self.logger = log_manager

    def process_request(self, data):
        request_type = data.get("requestType")
        if not request_type:
            return self._error("REQUEST", "Missing requestType in request")

        try:
            self.state.update_step(request_type, "requested", "Request sent to ATC")
            self.agent.set_request(request_type, True)

            self.logger.log_request(
                pilot_id=self.sid,
                request_type=request_type,
                status="requested",
                message="Request sent to ATC"
            )

            return {
                "responses": [
                    {
                        "event": "requestAcknowledged",
                        "payload": {
                            "requestType": request_type,
                            "status": "requested",
                            "message": "Request sent to ATC",
                            "timestamp": get_current_timestamp()
                        }
                    }
                ]
            }

        except Exception as e:
            return self._error("REQUEST", str(e), request_type)

    def cancel_request(self, data):
        request_type = data.get("requestType")
        if not request_type:
            return self._error("CANCEL", "Missing requestType in cancel request")

        cancel_result = self.state.cancel_request(request_type)
        if "error" in cancel_result:
            return self._error("CANCEL", cancel_result["error"], request_type)

        try:
            self.agent.set_request(request_type, False)
            self.logger.log_request(
                pilot_id=self.sid,
                request_type=request_type,
                status="cancelled",
                message="Cancelled by pilot"
            )
        except Exception as e:
            return self._error("CANCEL", f"Failed to cancel in agent: {str(e)}", request_type)

        return {
            "responses": [
                {
                    "event": "requestCancelled",
                    "payload": {
                        **cancel_result,
                        "timestamp": get_current_timestamp()
                    }
                }
            ]
        }

    def process_action(self, data):
        action = data.get("action")
        request_type = data.get("requestType")

        if not action:
            return self._error("ACTION", "Missing action")

        config = ACTION_DEFINITIONS.get(action)
        if not config:
            return self._error("ACTION", f"Unknown action: {action}", request_type)

        if config.get("requiredType") and request_type not in config.get("allowedTypes", []):
            return self._error("ACTION", f"Invalid requestType for action '{action}'", request_type)

        final_type = config.get("fixedType", request_type)
        message = config["message"](final_type)

        try:
            self.agent.set_action(action, True)
            self.state.update_step(final_type, config["status"], message)
            self.logger.log_action(self.sid, action, config["status"], message)

            return {
                "responses": [
                    {
                        "event": "actionAcknowledged",
                        "payload": {
                            "requestType": final_type,
                            "action": action,
                            "status": config["status"],
                            "message": message,
                            "timestamp": get_current_timestamp()
                        }
                    }
                ]
            }

        except Exception as e:
            return self._error("ACTION", str(e), final_type)



    # def start_timer(request_type: str, socket_manager):
    #     duration = TIMER_DURATION
    #     pilot_state.steps[request_type]["timeLeft"] = duration

    #     stop_event = threading.Event()
    #     socket_manager._timers[request_type] = stop_event

    #     def tick_loop():
    #         for remaining in range(duration, 0, -1):
    #             if stop_event.is_set():
    #                 print(f"[TIMER] ⏹ Timer for '{request_type}' stopped early.")
    #                 return

    #             pilot_state.steps[request_type]["timeLeft"] = remaining
    #             socket_manager.send("tick", {
    #                 "requestType": request_type,
    #                 "timeLeft": remaining
    #             })

    #             time.sleep(1)

    #         pilot_state.update_step(request_type, "timeout", "No pilot response within time window")

    #         socket_manager.send("timeout", {
    #             "requestType": request_type,
    #             "status": "timeout",
    #             "message": "No pilot response within 90s"
    #         })

    #         del socket_manager._timers[request_type]

    #     threading.Thread(target=tick_loop, daemon=True).start()


    def _error(self, context, message, request_type=None, status="error"):
        self.logger.log_error(f"{context}:{self.sid}", message)
        return {
            "responses": [
                {
                    "event": "error",
                    "payload": {
                        "requestType": request_type,
                        "status": status,
                        "message": message,
                        "timestamp": get_current_timestamp()
                    }
                }
            ]
        }
