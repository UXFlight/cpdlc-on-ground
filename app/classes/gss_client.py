import socketio
from typing import Any, Callable
from app.utils.types import StepUpdatePayload


class GSSClient:
    def __init__(self):
        self.sio = socketio.Client(
            reconnection=True,
            reconnection_attempts=5,
            reconnection_delay=2
        )
        self.connected = False

    def connect(self) -> None:
        self.init_events()
        try:
            self.sio.connect("http://localhost:5322", auth={"client_type": "PB"})
        except Exception as e:
            print(f"[GSS] ❌ Failed to connect to GSS: {e}")

    def init_events(self) -> None:
        self.sio.on("connect", self.on_connect)
        self.sio.on("disconnect", self.on_disconnect)

    def on_connect(self) -> None:
        self.connected = True
        print("[GSS] ✅ Connected to Global State Server.")

    def on_disconnect(self) -> None:
        self.connected = False
        print("[GSS] ❌ Disconnected from Global State Server.")

    def listen(self, event: str, callback: Callable[[Any], None]) -> None:
        self.sio.on(event, callback)

    def send_new_pilot(self, sid: str) -> None:
        if not self.connected:
            print("[GSSClient] ⚠️ Not connected to GSS, pilot not sent.")
            return
        self.sio.emit("new_pilot", sid)

    def send_pilot_disconnected(self, sid: str) -> None:
        if not self.connected:
            print("[GSSClient] ⚠️ Not connected to GSS, pilot not sent.")
            return
        self.sio.emit("pilot_disconnected", sid)

    def send_update_step(self, step_data: StepUpdatePayload) -> None:
        if not self.connected:
            print("[GSSClient] ⚠️ Not connected to GSS, step not sent.")
            return
        self.sio.emit("update_step", step_data)


gss_client = GSSClient()