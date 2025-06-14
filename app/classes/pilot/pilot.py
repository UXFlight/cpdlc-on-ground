from app.classes.state.state import PilotState
from app.classes.ingsvc.agent import Echo
from app.managers.log_manager.log_manager import LogManager
from app.managers.log_manager.log_manager_instance import logger
from app.utils.constants import ACTION_DEFINITIONS
from app.utils.time_utils import get_current_timestamp
from app.managers import TimerManager
from app.classes.socket.socket import SocketService

class Pilot:
    def __init__(self, sid: str):
        self.sid = sid
        self.state = PilotState()
        self.agent = Echo(sid)
        self.logger = logger
        self.timerManager = TimerManager(self.sid)

    def get_step(self, request_type : str):
        step = self.state.steps.get(request_type)
        return step if step else None

    def process_request(self, data):
        request_type = data.get("requestType")
        if not request_type:
            return self._error("REQUEST", "Missing requestType in request")

        try:
            result = self.state.update_step(request_type, "requested", "Request sent to ATC")
            if "error" in result:
                return self._error("REQUEST", result["error"], request_type)

            self.agent.set_request(request_type, True)
            self.logger.log_request(
                pilot_id=self.sid,
                request_type=request_type,
                status="requested",
                message="Request sent to ATC"
            )

            return {
                "event": "requestAcknowledged",
                "payload": result
            }

        except Exception as e:
            return self._error("REQUEST", str(e), request_type)


    def cancel_request(self, data):
        request_type = data.get("requestType")
        if not request_type:
            return self._error("CANCEL", "Missing requestType in cancel request")
        
        step = self.get_step(request_type)
        if not step or step.status != "requested":
            return self._error("CANCEL", f"Unauthorized cancel: {request_type}", request_type)

        result = self.state.update_step(request_type, "cancelled", "Request cancelled by pilot")
        if "error" in result:
            return self._error("CANCEL", result["error"], request_type)

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
            "event": "requestCancelled",
            "payload": result
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
            result = self.state.update_step(final_type, config["status"], message)
            if "error" in result:
                return self._error("ACTION", result["error"], final_type)

            self.logger.log_action(
                pilot_id=self.sid,
                action_type=action,
                status=config["status"],
                message=message
            )

            result["action"] = action 

            return {
                "event": "actionAcknowledged",
                "payload": result
            }

        except Exception as e:
            return self._error("ACTION", str(e), final_type)

    def _error(self, context, message, request_type=None, status="error"):
        self.logger.log_error(
                pilot_id=self.sid,
                context=f"{context}:{self.sid}", 
                error=message
            )
        return {
            "event": "error",
            "payload": {
                "requestType": request_type,
                "status": status,
                "message": message,
                "timestamp": get_current_timestamp()
            }
        }
    
    def start_timer_for_step(self, request_type: str, socket: SocketService):
        step = self.get_step(request_type)
        step.time_left = 90
        self.timerManager.start_timer(
            step=step,
            socket=socket,
            sid=self.sid,
            on_timeout=lambda: self.logger.log_event(self.sid, "TIMEOUT", f"{request_type} expired.")
        )
    
    def cleanup(self):
        try:
            self.logger.log_event(
                pilot_id=self.sid,
                event_type="SYSTEM",
                message="Cleaning up pilot session."
            )

            self.agent.disconnect()
            self.state.reset()

            self.logger.log_event(
                pilot_id=self.sid,
                event_type="SYSTEM",
                message="Pilot cleanup complete."
            )

        except Exception as e:
            self.logger.log_error(
                pilot_id=self.sid,
                context=f"CLEANUP:{self.sid}",
                error=f"Cleanup failed: {e}"
            )
