from datetime import datetime
from app.classes.state.state import PilotState
from app.classes.ingsvc.agent import Echo
from app.classes.state.step import Step
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
        self.timer_manager = TimerManager(self.sid)

    def get_step(self, request_type : str):
        step = self.state.steps.get(request_type)
        return step if step else None

    # === HANDLING REQUESTS === #
    def process_request(self, data):
        request_type = data.get("requestType")
        if not request_type:
            return self._error("REQUEST", "Missing requestType in request")

        step : Step = self.get_step(request_type)
        if not step:
            return self._error("REQUEST", f"Unknown step: {request_type}", request_type)

        print(step.status)
        if step.status not in (None, "standby", "cancelled", "timeout", "unable", "cancel"):
            return self._error("REQUEST", f"{request_type} already in progress", request_type)

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

    # === CANCEL REQUEST HANDLING === #
    def cancel_request(self, data):
        request_type = data.get("requestType")
        if not request_type:
            return self._error("CANCEL", "Missing requestType in cancel request")

        step = self.get_step(request_type)
        if not step:
            return self._error("CANCEL", f"Unknown step: {request_type}", request_type)

        if step.status != "requested":
            return self._error("CANCEL", f"Cannot cancel {request_type} at status {step.status}", request_type)

        result = self.state.update_step(request_type, "cancelled", "Request cancelled by pilot")
        if "error" in result:
            return self._error("CANCEL", result["error"], request_type)

        try:
            self.agent.set_request(request_type, False)
            self.logger.log_request(
                pilot_id=self.sid,
                request_type=request_type,
                status="cancelled",
                message="Cancelled by pilot",
                time_left=step.time_left
            )

        except Exception as e:
            return self._error("CANCEL", f"Failed to cancel in agent: {str(e)}", request_type)

        return {
            "event": "requestCancelled",
            "payload": result
        }


    # === ACTION HANDLING === #
    def process_action(self, data):
        action = data.get("action")
        print(f"[ACTION] {self.sid} - Processing action: {action}")
        request_type = data.get("requestType")

        if not request_type:
            return self._error("ACTION", "Missing requestType for action")
        if not action:
            return self._error("ACTION", "Missing action", request_type)

        config = ACTION_DEFINITIONS.get(action)
        if not config:
            return self._error("ACTION", f"Unknown action: {action}", request_type)

        if config.get("requiredType") and request_type not in config.get("allowedTypes", []):
            return self._error("ACTION", f"Invalid requestType for action '{action}'", request_type)

        final_type = config.get("fixedType", request_type)
        step = self.get_step(final_type)
        if not step:
            return self._error("ACTION", f"Unknown step: {final_type}", final_type, "error", step.time_left)

        valid_transitions = {
            "new": {"load", "wilco", "standby", "unable"},
            "loaded": {"execute", "cancel"} if request_type == "taxi_clearance" else {"wilco", "standby", "unable"},
            "executed": {"wilco", "standby", "unable"},
            "standby": {"wilco", "standby", "unable"},
        }

        allowed = valid_transitions.get(step.status, set())
        if action not in allowed:
            return self._error("ACTION", f"Action '{action}' not allowed at status '{step.status}'", final_type, "error", step.time_left)

        if action in ("wilco", "cancel", "unable"):
            self.timer_manager.stop_timer(final_type)
            time_left = None
        elif action == "standby":
            time_left = 300
        else:
            time_left = step.time_left

        message = config["message"](request_type)

        try:
            self.agent.set_action(action, True)
            result = self.state.update_step(final_type, config["status"], message, time_left)
            if "error" in result:
                return self._error("ACTION", result["error"], final_type, "error", step.time_left)

            self.logger.log_action(
                pilot_id=self.sid,
                action_type=action,
                status=config["status"],
                message=message,
                time_left=step.time_left
            )

            result["action"] = action

            return {
                "event": "actionAcknowledged",
                "payload": result
            }

        except Exception as e:
            return self._error("ACTION", str(e), final_type, "error", step.time_left)


    # === UTILS ERROR HANDLING === #
    def _error(self, context, message, request_type=None, status="error", time_left=None):
        self.logger.log_error(
            pilot_id=self.sid,
            context=f"{context}:{self.sid}",
            error=message,
            time_left=time_left
        )

        iso_timestamp = get_current_timestamp()
        time_only = datetime.fromisoformat(iso_timestamp).strftime("%H:%M:%S")

        return {
            "event": "error",
            "payload": {
                "requestType": request_type,
                "status": status,
                "message": message,
                "timestamp": time_only
            }
        }
    
    # === TIMER MANAGEMENT === #
    def start_timer_for_step(self, request_type: str, socket: SocketService):
        step = self.get_step(request_type)
        if not step:
            return

        print(f"[TICK  ] {self.sid} - {request_type} tick: {step.time_left}s left.")
        logger.log_event(self.sid, 'TICK', f"{request_type} — {step.time_left}s left")
        self.timer_manager.start_timer(
            step=step,
            request_type=request_type,
            on_tick=lambda rt, s: self.handle_tick(rt, s, socket),
            on_timeout=lambda rt, s: self.handle_timeout(rt, s, socket)
        )

    # === ATC TICK HANDLING === #
    def handle_tick(self, request_type: str, step : Step, socket: SocketService):
        socket.send("tick", {
            "requestType": request_type,
            "timeLeft": step.time_left
        }, room=self.sid)

    # === ATC TIMEOUT HANDLING === #
    def handle_timeout(self, request_type: str, step: Step, socket: SocketService):
        if step.status in ("wilco", "cancelled", "unable", "executed", "closed"):
            print(f"[TIMEOUT] {self.sid} - Ignored timeout for {request_type} — already {step.status}")
            self.logger.log_event(self.sid, "TIMEOUT_SKIP", f"Ignored timeout for {request_type} — already {step.status}")
            return

        self.state.update_step(request_type, "timeout", "ATC request timed out.")
        self.logger.log_event(self.sid, "TIMEOUT", f"{request_type} expired.")

        socket.send("atcTimeout", {
            "requestType": request_type,
            "status": step.status,
            "message": "ATC request timed out.",
            "timestamp": step.timestamp,
            "timeLeft": step.time_left,
        }, room=self.sid)
        print(f"[TIMEOUT  ] {self.sid} - {request_type} timed out.")

    # === CLEANUP === #
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
