from flask import request # type: ignore
import threading    
import random
import uuid
from app.managers import PilotManager, LogManager
from app.managers.log_manager.log_manager_instance import logger
from app.utils.time_utils import get_current_timestamp_in_ms
from typing import TYPE_CHECKING
from app.utils.constants import DEFAULT_ATC_RESPONSES

if TYPE_CHECKING:
    from app.classes.pilot.pilot import Pilot
    from app.managers.pilot_manager.pilot_manager import PilotManager
    from app.classes.socket.socket import SocketService
class SocketManager:
    def __init__(self, socket_service: "SocketService", pilot_manager: "PilotManager"):
        self.socket: "SocketService" = socket_service
        self.pilots: "PilotManager" = pilot_manager
        self.logger : LogManager = logger

    def _emit_event(self, sid : str, result):
        if not result or not isinstance(result, dict):
            self.logger.log_error(pilot_id=sid, context="SOCKET", error="Invalid result payload")
            return
        self.socket.send(result["event"], result["payload"], room=sid)

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
        pilot : Pilot = self.pilots.get_or_create(sid)
        #! SIMULTES ATC CONNECTION
        delay = random.uniform(1.0, 3.0)
        payload = {
            'facility': 'KLAX',
            'sid': pilot.sid,
            'connectedSince': get_current_timestamp_in_ms()
        }
        threading.Timer(delay, lambda: self.socket.send('connectedToATC', payload)).start()

    ### === Disconnect Event === ###
    def on_disconnect(self):
        sid = request.sid
        self.logger.log_event(
            pilot_id=sid, 
            event_type="SOCKET", 
            message=f"⚠️ Pilot disconnected: {sid}"
        )
        pilot = self.pilots.get_or_create(sid)
        if pilot:
            pilot.timerManager.stop_all()
        self.pilots.remove(sid)

    ### === SendRequest Event === ###
    def on_send_request(self, data):
        sid = request.sid
        pilot : "Pilot" = self.pilots.get_or_create(sid)

        try:
            result = pilot.process_request(data)
            self._emit_event(sid, result)

            request_type = data.get("requestType")
            if request_type:
                request_id = str(uuid.uuid4())
                step = pilot.get_step(request_type)
                if (step):
                    step.request_id = request_id
                    step.cancelled = False
                    delay = random.uniform(2.0, 8.0)
                    threading.Timer(delay, lambda: self._simulate_and_emit_response
                        ( pilot, sid, request_type, request_id )).start()

        except Exception as e:
            error_payload = pilot._error(
                context="REQUEST",
                message=str(e),
                request_type=data.get("requestType")
            )
            self._emit_event(sid, error_payload)

    ### === CancelRequest Event === ###
    def on_cancel_request(self, data):
        sid = request.sid
        pilot = self.pilots.get_or_create(sid)
        result = pilot.cancel_request(data)
        self._emit_event(sid, result)

    ### === Action Event === ###
    def on_action_event(self, data):
        sid = request.sid
        pilot : Pilot = self.pilots.get_or_create(sid)

        action = data.get("action")
        request_type = data.get("requestType")

        if not action:
            error_payload = pilot._error(
                context="ACTION",
                message="Missing 'action' field from client",
                request_type=request_type
            )
            self._emit_event(sid, error_payload)
            return

        try:
            result = pilot.process_action({
                "action": action,
                "requestType": request_type
            })
            self._emit_event(sid, result)

        except Exception as e:
            error_payload = pilot._error(
                context="ACTION",
                message=str(e),
                request_type=request_type
            )
            self._emit_event(sid, error_payload)

    ### Simulates ATC response and emits event
    def _simulate_and_emit_response(self, pilot : "Pilot", sid : str, request_type : str, request_id : str):
        step = pilot.state.steps.get(request_type)
        if not step:
            return

        if step.request_id != request_id or step.status != "requested": #! if request_id is outdated
            self.logger.log_event( pilot.sid, "SKIP", f"Ignored outdated thread for {request_type}" )
            return

        message = DEFAULT_ATC_RESPONSES.get(request_type, f"ROGER, {request_type.upper()}")

        pilot.state.update_step(request_type, "new", message, 90)
        pilot.agent.set_request(request_type, False)

        self.logger.log_request(
            pilot_id=pilot.sid,
            request_type=request_type,
            status="new",
            message=message
        )

        self.socket.send("atcResponse", {
            "requestType": request_type,
            "status": step.status,
            "message": step.message,
            "timestamp": step.timestamp,
            "timeLeft": step.time_left,
        }, room=sid)

        pilot.start_timer_for_step(request_type, self.socket)
