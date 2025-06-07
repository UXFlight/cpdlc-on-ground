from flask import request
from app.managers import log_manager
import random
import threading

class SocketManager:
    def __init__(self, socket_service, pilot_manager):
        self.socket = socket_service
        self.pilots = pilot_manager
        self.logger = log_manager

    def _emit_all(self, sid, result):
        if result and isinstance(result, dict) and "responses" in result:
            for r in result["responses"]:
                self.socket.send(r["event"], r["payload"], room=sid)

    def init_events(self):
        self.socket.listen("connect", self.on_connect)
        self.socket.listen("disconnect", self.on_disconnect)
        self.socket.listen("sendRequest", self.on_send_request)
        self.socket.listen("cancelRequest", self.on_cancel_request)
        self.socket.listen("sendAction", self.on_action_event)

    ### === Connect Event === ###
    def on_connect(self, auth=None):
        sid = request.sid
        self.logger.log_event(
            pilot_id=sid, 
            event_type="SOCKET", 
            message=f"✅ Pilot connected: {sid}"
            )
        self.pilots.get_or_create(sid)

    ### === Disconnect Event === ###
    def on_disconnect(self):
        sid = request.sid
        self.logger.log_event(
            pilot_id=sid, 
            event_type="SOCKET", 
            message=f"⚠️ Pilot disconnected: {sid}"
            )
        self.pilots.remove(sid)

    ### === SendRequest Event === ###
    def on_send_request(self, data):
        sid = request.sid
        pilot = self.pilots.get_or_create(sid)
        result = pilot.process_request(data)
        self._emit_all(sid, result)

        request_type = data.get("requestType")
        if request_type:
            delay = random.uniform(4.0, 8.0)
            threading.Timer(delay, lambda: self._simulate_and_emit_response(pilot, sid, request_type)).start()


    ### === CancelRequest Event === ###
    def on_cancel_request(self, data):
        sid = request.sid
        pilot = self.pilots.get_or_create(sid)
        result = pilot.cancel_request(data)
        self._emit_all(sid, result)

    ### === Action Event === ###
    def on_action_event(self, data):
        sid = request.sid
        pilot = self.pilots.get_or_create(sid)

        action = data.get("action")
        request_type = data.get("requestType")

        if not action:
            self.logger.log_error(
                pilot_id=sid,
                context="ACTION", 
                error="Missing 'action' field from client"
                )
            self.socket.send("error", {"message": "Missing 'action'"}, room=sid)
            return

        try:
            result = pilot.process_action({"action": action, "requestType": request_type})
            self._emit_all(sid, result)

        except Exception as e:
            self.logger.log_error(
                pilot_id=sid, 
                context="ACTION", 
                error=e
                )
            self.socket.send("error", {"message": str(e)}, room=sid)


    ### Simulates ATC response and emits event
    def _simulate_and_emit_response(self, pilot, sid, request_type):
        pilot.state.update_step(request_type, "responded", "ATC has responded.")
        pilot.agent.set_request(request_type, False)

        self.logger.log_request(
            pilot_id=pilot.sid,
            request_type=request_type,
            status="responded",
            message="Simulated ATC response"
        )

        step = pilot.state.steps.get(request_type)
        if not step:
            return

        self.socket.send("atcResponse", {
            "requestType": request_type,
            "status": "responded",
            "message": "ATC has responded.",
            "timestamp": step.timestamp
        }, room=sid)