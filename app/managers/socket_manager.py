from flask import request  # type: ignore
import threading
import random
from typing import TYPE_CHECKING
from app.utils.constants import DEFAULT_ATC_RESPONSES, TIMER_DURATION
from app.utils.time_utils import get_current_timestamp
from app.utils.types import GssConnectInfo, SocketError, UpdateStepData
from app.managers.log_manager import logger

if TYPE_CHECKING:
    from app.classes.pilot import Pilot
    from app.managers.pilot_manager import PilotManager
    from app.managers.atc_manager import AtcManager
    from app.classes.socket import SocketService


class SocketManager:
    def __init__(self, socket_service: "SocketService", pilot_manager: "PilotManager", atc_manager: "AtcManager"):
        self.socket: "SocketService" = socket_service
        self.pilots: "PilotManager" = pilot_manager
        self.atc_manager: "AtcManager" = atc_manager
        self.logger = logger
        self.gss_connection_info: GssConnectInfo = {
            "facility": "",
            "connectedSince": get_current_timestamp()
        }

    def _emit_event(self, sid: str, result: dict | SocketError):
        if not result or not isinstance(result, dict):
            self.logger.log_error(pilot_id=sid, context="SOCKET", error="Invalid result payload")
            return
        self.socket.send(result["event"], result["payload"], room=sid)

    def init_events(self):
        self.socket.listen("connect", self.on_connect)
        self.socket.listen("disconnect", self.on_disconnect)

        # PILOT EVENTS
        self.socket.listen("sendRequest", self.on_send_request)
        self.socket.listen("cancelRequest", self.on_cancel_request)
        self.socket.listen("sendAction", self.on_action_event)
        
        # ATC EVENTS
        self.socket.listen("get_pilot_list", self.handle_pilot_list)

        # GSS EVENTS
        # gss_client.listen("gss_connected", self.on_gss_connect)
        # gss_client.listen("step_updated", self.on_receive_step_update)

    ## PILOT UIS EVENTS
    ## === CONNECT
    def on_connect(self, auth=None):
        sid = request.sid
        role = auth.get("r") if auth else None  # 0 = pilot, 1 = atc

        if role == 0:
            self.pilots.create(sid)
            logger.log_event(pilot_id=sid, event_type="SOCKET", message=f"Pilot connected: {sid}")
            if self.atc_manager.has_any():
                self.socket.send("new_pilot_connected", {"sid": sid}, room="atc_room")

        elif role == 1:
            self.atc_manager.create(sid)
            self.socket.enter_room(sid, room="atc_room")
            logger.log_event(pilot_id=sid, event_type="SOCKET", message=f"ATC connected: {sid}")
            for pid in self.pilots.get_all_sids():
                self.socket.send("new_pilot_connected", {"sid": pid}, room=sid)

        else:
            logger.log_event(pilot_id=sid, event_type="SOCKET", message="Unknown role -- disconnecting")
            self.socket.disconnect(sid)

    def on_disconnect(self):
        sid = request.sid

        if self.pilots.exists(sid):
            self.pilots.remove(sid)
            logger.log_event(pilot_id=sid, event_type="SOCKET", message=f"Pilot disconnected: {sid}")

            if self.atc_manager.has_any():
                self.socket.send("pilot_disconnected", {"sid": sid}, room="atc_room")

        elif self.atc_manager.exists(sid):
            self.atc_manager.remove(sid)
            logger.log_event(pilot_id=sid, event_type="SOCKET", message=f"ATC disconnected: {sid}")

        else:
            logger.log_event(pilot_id=sid, event_type="SOCKET", message="Unknown SID disconnected")


    ## === SEND REQUESTS
    def on_send_request(self, data: dict):
        sid = request.sid
        pilot = self.pilots.get(sid)
        
        print("REQUEST DATA", data)

        try:
            step_payload: UpdateStepData = pilot.handle_send_request(data)
            print("STEP PAYLOAD", step_payload.to_dict())
            # gss_client.send_update_step(step_payload.to_dict())
            self._emit_event(sid, {
                "event": "requestAcknowledged",
                "payload": step_payload.to_ack_payload()
            })

        except Exception as e:
            error_payload: SocketError = pilot._error("REQUEST", str(e), data.get("requestType"))
            self._emit_event(sid, error_payload)

    ## === CANCEL REQUEST
    def on_cancel_request(self, data: dict):
        sid = request.sid
        pilot = self.pilots.get(sid)

        try:
            update_data: UpdateStepData = pilot.handle_cancel_request(data)
            # gss_client.send_update_step(update_data.to_dict())

            self._emit_event(sid, {
                "event": "requestCancelled",
                "payload": update_data.to_ack_payload()
            })

        except Exception as e:
            error_payload: SocketError = pilot._error("CANCEL", str(e), data.get("requestType"))
            self._emit_event(sid, error_payload)

    ## === ACTION EVENTS
    def on_action_event(self, data: dict):
        sid = request.sid
        pilot = self.pilots.get(sid)

        try:
            update_data : UpdateStepData = pilot.process_action(data)
            # gss_client.send_update_step(update_data.to_dict())
            self._emit_event(sid, {
                "event": "actionAcknowledged",
                "payload": update_data.to_ack_payload()
            })

        except Exception as e:
            error_payload = pilot._error("ACTION", str(e), data.get("requestType"))
            self._emit_event(sid, error_payload)


    ## GSS EVENTS
    ## === CONNECT
    def on_gss_connect(self, data: dict):
        print("[GSS] Connected to ATC", data)
        self.gss_connection_info : GssConnectInfo = {
            "facility": data.get("facility") or "",
            "connectedSince": data.get("connected_since") or ""
        }

        for sid in self.pilots.get_all_sids():
            self.socket.send("connectedToAtc", self.gss_connection_info, room=sid)

    # ## === STEP UPDATE
    def on_receive_step_update(self, data: dict):
        sid = data.get("pilot_sid")
        if not sid:
            print("[RECEIVE] ❌ Missing pilot_sid in update")
            return

        pilot = self.pilots.get(sid)
        update = UpdateStepData.from_dict(data)
        if not update:
            error = pilot._error("UPDATE", "Malformed update from GSS")
            self._emit_event(sid, error)
            return

        try:
            step_dict = pilot.handle_step_update(update)
            
            # self.socket.send("atcResponse", {
            #     "step_code": step_code,
            #     "status": update.status.value,
            #     "message": update.message,
            #     "timestamp": update.validated_at,
            #     "time_left": update.time_left,
            # }, room=sid)

            logger.log_request(
                pilot_id=sid,
                request_type=update.step_code,
                status=update.status.value,
                message=update.message,
                time_left=update.time_left
            )

        except Exception as e:
            error_payload = pilot._error("GSS_UPDATE", str(e), update.step_code)
            self._emit_event(sid, error_payload)
    
    ## ATC EVENTS
    ## === PILOT LIST
    def handle_pilot_list(self, data: dict):
        sid = request.sid
        pilot_list : Pilot = self.pilots.get_all_pilots()

    ## helpers
    def send_to_all_atc(self, event: str, data: dict) -> None:
        self.socket.send(event, data, room="atc_room")
