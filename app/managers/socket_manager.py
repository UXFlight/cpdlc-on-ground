from flask import request  # type: ignore
from typing import TYPE_CHECKING, Optional
from app.utils.constants import DEFAULT_PILOT_REQUESTS, TIMER_DURATION
from app.utils.time_utils import get_current_timestamp
from app.utils.types import ConnectInfo, PilotPublicView, SocketError, StepStatus, UpdateStepData
from app.managers.log_manager import logger

if TYPE_CHECKING:
    from app.classes.pilot import Pilot
    from app.classes.socket import SocketService
    from app.managers.pilot_manager import PilotManager
    from app.managers.atc_manager import AtcManager
    from app.managers.airport_map_manager import AirportMapManager


class SocketManager:
    def __init__(self, socket_service: "SocketService", pilot_manager: "PilotManager", atc_manager: "AtcManager", airport_map_manager : "AirportMapManager"):
        self.socket: "SocketService" = socket_service
        self.pilots: "PilotManager" = pilot_manager
        self.atc_manager: "AtcManager" = atc_manager
        self.airport_map_manager : "AirportMapManager" = airport_map_manager
        
        # not injected
        self.logger = logger
        self.connection_info: ConnectInfo = {
            "facility": "KLAX",
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
        self.socket.listen("getPilotList", self.handle_pilot_list)
        self.socket.listen("selectPilot", self.handle_atc_select_pilot)
        self.socket.listen("getAirportMapData", self.handle_map_request)

        # GSS EVENTS
        # gss_client.listen("gss_connected", self.on_gss_connect)
        # gss_client.listen("step_updated", self.on_receive_step_update)
        self.socket.listen("atcSendResponse", self.on_receive_atc_response)

    ## PILOT UIS EVENTS
    ## === CONNECT
    def on_connect(self, auth=None):
        sid = request.sid # type: ignore
        role = auth.get("r") if auth else None  # 0 = pilot, 1 = atc

        if role == 0:
            public_view : PilotPublicView = self.pilots.create(sid)
            logger.log_event(pilot_id=sid, event_type="SOCKET", message=f"Pilot connected: {sid}")
            self.socket.send("connectedToAtc", self.connection_info, room=sid)
            if self.atc_manager.has_any():
                self.socket.send("pilot_connected", public_view, room="atc_room")

        elif role == 1:
            self.atc_manager.create(sid)
            self.socket.enter_room(sid, room="atc_room")
            logger.log_event(pilot_id=sid, event_type="SOCKET", message=f"ATC connected: {sid}")
            pilot_list = self.pilots.get_all_pilots()
            self.socket.send("pilot_list", [pilot.to_public() for pilot in pilot_list], room=sid)
            atc_list = self.atc_manager.get_all()
            self.socket.send("atc_list", atc_list, room="atc_room") #! send to either atc_sid or all atcs in 'atc_room'

        else:
            logger.log_event(pilot_id=sid, event_type="SOCKET", message="Unknown role -- disconnecting")
            self.socket.disconnect(sid)

    def on_disconnect(self):
        sid = request.sid # type: ignore

        if self.pilots.exists(sid):
            self.pilots.remove(sid)
            logger.log_event(pilot_id=sid, event_type="SOCKET", message=f"Pilot disconnected: {sid}")

            if self.atc_manager.has_any():
                self.socket.send("pilot_disconnected", sid, room="atc_room")

        elif self.atc_manager.exists(sid):
            self.atc_manager.remove(sid)
            atc_list = self.atc_manager.get_all()
            self.socket.send("atc_list", atc_list, room="atc_room")
            logger.log_event(pilot_id=sid, event_type="SOCKET", message=f"ATC disconnected: {sid}")

        else:
            logger.log_event(pilot_id=sid, event_type="SOCKET", message="Unknown SID disconnected")


    ## === SEND REQUESTS
    def on_send_request(self, data: dict):
        sid = request.sid # type: ignore
        pilot : Pilot = self.pilots.get(sid)

        try:
            step_payload: UpdateStepData = pilot.handle_send_request(data)
            # gss_client.send_update_step(step_payload.to_dict())
            self._emit_event(sid, {
                "event": "requestAcknowledged",
                "payload": step_payload.to_ack_payload()
            })
            
            message = self.interpolate_request_message(step_payload.step_code, pilot, data.get("direction"))
            step_payload.message = message
            
            status = self.parse_status(step_payload.status)
            step_payload.status = status
                     
            self._emit_event("atc_room", {
                "event": "new_request",
                "payload": step_payload.to_atc_payload()
            })

        except Exception as e:
            error_payload: SocketError = pilot._error("REQUEST", str(e), data.get("requestType"))
            self._emit_event(sid, error_payload)
            
    def interpolate_request_message(self, step_code: str, pilot: "Pilot", direction: Optional[str] = None) -> str:
            raw_msg = DEFAULT_PILOT_REQUESTS.get(step_code, "Request sent")

            from_loc = pilot.plane.get("from_location", {})
            location_str = f"{from_loc.get('name')} ({from_loc.get('type')})" if from_loc else "UNKNOWN POS"
            dir_str = direction.upper() if direction else "UNKNOWN DIR"

            return (
                raw_msg
                .replace("[pos]", location_str)
                .replace("[dir]", dir_str)
            )
            
    def parse_status(self, status: StepStatus) -> StepStatus:
        if status == StepStatus.REQUESTED:
            return StepStatus.NEW
        return status

    ## === CANCEL REQUEST
    def on_cancel_request(self, data: dict):
        sid = request.sid # type: ignore
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
        sid = request.sid # type: ignore
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
    # ## === STEP UPDATE
    def on_receive_atc_response(self, data: dict):
        print(data)
        sid = request.sid # type: ignore # atc sid
        pilot_sid = data.get("pilot_sid")
        if not pilot_sid:
            print("[RECEIVE] Missing pilot_sid in update")
            return

        pilot = self.pilots.get(sid)
        update = UpdateStepData.from_dict(data)
        if not update:
            error = pilot._error("UPDATE", "Malformed update from GSS")
            self._emit_event(sid, error)
            return

        try:
            step_dict = pilot.handle_step_update(update)
            
            self.socket.send("atcResponse", {
                "step_code": step_dict["step_code"],
                "status": update.status.value,
                "message": update.message,
                "timestamp": update.validated_at,
                "time_left": update.time_left,
            }, room=sid)

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
    def handle_pilot_list(self):
        sid = request.sid # type: ignore
        pilot_list : list[Pilot] = self.pilots.get_all_pilots()
        pilot_list_data = [pilot.to_public() for pilot in pilot_list]
        self.socket.send("pilot_list", pilot_list_data, room=sid)

    ## === SELECT PILOT
    def handle_atc_select_pilot(self, pilot_sid: str):
        sid = request.sid # type: ignore
        if not pilot_sid:
            self.socket.send("error", {"message": "Missing pilot SID"}, room=sid)
            return

        if not self.pilots.exists(pilot_sid):
            self.socket.send("error", {"message": f"Pilot with SID {pilot_sid} does not exist"}, room=sid)
            return
        
        atc = self.atc_manager.get(sid)
        if not atc:
            self.socket.send("error", {"message": "ATC not connected"}, room=sid)
            return
        
        atc.selected_pilot = pilot_sid
        self.socket.send("selected_pilot", atc.to_public(), room="atc_room")

    ## === MAP REQUEST
    def handle_map_request(self):
        sid = request.sid # type: ignore
        if not self.airport_map_manager:
            self.socket.send("error", {"message": "Airport map manager not initialized"}, room=sid)
            return

        map_data = self.airport_map_manager.get_map()
        if not map_data:
            self.socket.send("error", {"message": "No airport map data available"}, room=sid)
            return

        self.socket.send("airport_map_data", map_data, room=sid)