import socketio
import threading
import time
from enum import Enum
from typing import TypedDict, Optional

class StepStatus(Enum):
    IDLE = "IDLE"
    REQUESTED = "REQUESTED"
    NEW = "NEW"
    LOADED = "LOADED"
    EXECUTED = "EXECUTED"
    CANCELLED = "CANCELLED"
    CLOSED = "CLOSED"
    STANDBY = "STANDBY"
    UNABLE = "UNABLE"

class StepUpdatePayload(TypedDict):
    pilot_sid: str
    step_code: str
    label: str
    status: StepStatus
    message: str
    validated_at: float
    request_id: str
    timestamp: float
    time_left: Optional[float]


class GSSClient:
    def __init__(self, reconnect_interval: float = 5.0):
        self.sio = socketio.Client()
        self.reconnect_interval = reconnect_interval
        self.connected = False

        @self.sio.event
        def connect():
            self.connected = True
            print("[GSS] ✅ Connected to Global State Server.")

        @self.sio.event
        def disconnect():
            self.connected = False
            print("[GSS] ❌ Disconnected from Global State Server.")
            threading.Thread(target=self._retry_connect, daemon=True).start()

        @self.sio.on("step_updated") # type: ignore
        def on_step_updated(data):
            print(f"[GSS] 🔄 Step updated: {data}")

    def connect(self):
        threading.Thread(target=self._retry_connect, daemon=True).start()

    def _retry_connect(self):
        while not self.connected:
            try:
                self.sio.connect("http://localhost:5322?client_type=P")
                return
            except Exception as e:
                print(f"[GSS] ⚠️ Failed to connect to GSS: {e}")
                time.sleep(self.reconnect_interval)

    def send_update_step(self, step_data: StepUpdatePayload):
        if not self.connected:
            print("[GSSClient] ⚠️ Not connected to GSS, step not sent.")
            return
        self.sio.emit("update_step", step_data)

gss_client = GSSClient()