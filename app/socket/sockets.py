from flask_socketio import SocketIO, emit  # type: ignore
from datetime import datetime
from app.services import socket_event_service

def current_timestamp():
    return datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

class SocketManager:
    def __init__(self):
        self.socketio = SocketIO(cors_allowed_origins="*")
        self._timers = {}

    def init_app(self, app):
        self.socketio.init_app(app)
        self._register_events()

    def _register_events(self):
        @self.socketio.on("connect")
        def handle_connect():
            print("[SOCKET] ✅ Client connected")
            self.socketio.start_background_task(self.simulate_atc_connection)

        @self.socketio.on("disconnect")
        def handle_disconnect():
            print("[SOCKET] ⚠️ Client disconnected")
            socket_event_service.handle_client_disconnect()

    def simulate_atc_connection(self):
        print("[SOCKET] 🌐 Simulating ATC connection...")
        self.send("connectedToATC", {"status": "connected", "facility": "KLAX"})

    def disconnect_from_atc(self):
        print("[SOCKET] 🔌 ATC disconnected.")
        self.send("disconnectedFromATC", {"status": "disconnected"})

    def send_message(self, request_type: str, message: str, status: str = "responded", timestamp: str = None):
        payload = {
            "requestType": request_type,
            "status": status,
            "message": message,
            "timestamp": timestamp or current_timestamp()
        }
        print(f"[SOCKET] 📤 Emitting 'atcResponse' → {payload}")
        self.send("atcResponse", payload)

    def send(self, event_name: str, payload: dict):
        """Méthode générique d’émission d’événement"""
        print(f"[SOCKET] ✉️  Emitting '{event_name}' with payload: {payload}")
        self.socketio.emit(event_name, payload)

    def run(self, app, **kwargs):
        print("[SOCKET] 🚀 Socket server running...")
        self.socketio.run(app, **kwargs)

    def stop_timer(self, request_type: str):
        """Arrête un timer spécifique (s'il existe)."""
        if request_type in self._timers:
            self._timers[request_type].set()
            del self._timers[request_type]
            print(f"[TIMER] 🛑 Timer manually stopped for '{request_type}'.")

    def stop_all_timers(self):
        """Arrête tous les timers actifs"""
        for request_type, stop_event in list(self._timers.items()):
            stop_event.set()
            print(f"[TIMER] 🛑 Timer stopped for '{request_type}'.")
        self._timers.clear()


# Instance globale
socket_manager = SocketManager()
