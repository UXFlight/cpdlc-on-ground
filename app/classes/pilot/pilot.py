import random
import threading
from app.classes.state.state import PilotState
from app.classes.ingsvc.agent import Echo
from app.classes.log import log_manager

class Pilot:
    def __init__(self, sid):
        self.sid = sid
        self.state = PilotState()
        self.agent = Echo(sid)
        self.logger = log_manager

    def process_request(self, data):
        request_type = data.get("requestType")

        if not request_type:
            return self._error("Missing requestType in request")

        try:
            self.state.update_step(request_type, "requested", "Request sent to ATC")
            self.agent.set_request(request_type, True)

            self.logger.log_request(
                pilot_id=self.sid,
                request_type=request_type,
                status="requested",
                message="Request sent to ATC"
            )

            delay = random.uniform(4.0, 8.0)
            threading.Timer(delay, lambda: self.simulate_atc_response(request_type)).start()

            return {
                "responses": [
                    {
                        "event": "requestAcknowledged",
                        "payload": {
                            "requestType": request_type,
                            "status": "requested"
                        }
                    }
                ]
            }
        except Exception as e:
            return self._error(str(e))

    def cancel_request(self, data):
        request_type = data.get("requestType")

        if not request_type:
            return self._error("Missing requestType in cancel request")

        cancel_result = self.state.cancel_request(request_type)

        if "error" in cancel_result:
            return self._error(cancel_result["error"])

        try:
            self.agent.set_request(request_type, False)
            self.logger.log_request(
                pilot_id=self.sid,
                request_type=request_type,
                status="cancelled",
                message="Cancelled by pilot"
            )
        except Exception as e:
            return self._error(f"Failed to cancel in agent: {str(e)}")

        return {
            "responses": [
                {
                    "event": "requestCancelled",
                    "payload": cancel_result
                }
            ]
        }

    def simulate_atc_response(self, request_type):
        self.state.update_step(request_type, "responded", "ATC has responded.")
        self.agent.set_request(request_type, False)

        self.logger.log_request(
            pilot_id=self.sid,
            request_type=request_type,
            status="responded",
            message="Simulated ATC response"
        )

    def _error(self, message):
        self.logger.log_error(f"Pilot:{self.sid}", message)
        return {
            "responses": [
                {
                    "event": "error",
                    "payload": {
                        "message": message
                    }
                }
            ]
        }
