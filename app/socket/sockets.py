from flask_socketio import SocketIO, emit
import time

class SocketManager:
    def __init__(self):
        self.socketio = SocketIO(cors_allowed_origins="*")

    def init_app(self, app):
        self.socketio.init_app(app)
        self._register_events()

    def _register_events(self):
        @self.socketio.on("connect")
        def handle_connect():
            print("[SOCKET] Client connected")
            self.socketio.start_background_task(self.simulate_atc_connection)

    def simulate_atc_connection(self):
        time.sleep(5)
        self.socketio.emit("connectedToATC", {"status": "connected", "facility": "KLAX"})

    def disconnect_from_atc(self):
        time.sleep(5)
        self.socketio.emit("disconnectedFromATC")

    def send_message(self, message):
        print(f"[SOCKET] Sending message: {message}")
        self.socketio.emit("atcResponse", {"data": message})
        


    def run(self, app, **kwargs):
        self.socketio.run(app, **kwargs)

socket_manager = SocketManager()
