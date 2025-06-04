from flask import request
from app.classes.log import log_manager

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
    def on_connect(self):
        sid = request.sid
        self.logger.log_event("SOCKET", f"✅ Pilot connected: {sid}")
        self.pilots.get_or_create(sid)

    ### === Disconnect Event === ###
    def on_disconnect(self):
        sid = request.sid
        self.logger.log_event("SOCKET", f"⚠️ Pilot disconnected: {sid}")
        self.pilots.remove(sid)

    ### === SendRequest Event === ###
    def on_send_request(self, data):
        sid = request.sid
        pilot = self.pilots.get_or_create(sid)
        result = pilot.process_request(data)
        self._emit_all(sid, result)

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
        result = pilot.process_action(data)
        self._emit_all(sid, result)
