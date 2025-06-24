import threading
import signal
import sys
import mimetypes
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from app.classes.ingsvc.agent import Echo
from app.classes.socket.socket import SocketService
from app.managers import PilotManager, SocketManager, PilotStats
from app.routes import general
from app.classes.gss.gss_client import gss_client

exit_event = threading.Event()

def create_app():
    mimetypes.add_type('application/javascript', '.js')
    app = Flask(__name__, static_url_path="/static", static_folder="static")
    CORS(app)
    socketio = SocketIO(app, cors_allowed_origins="*")
    return app, socketio

def start_ingscape():
    Echo.start_ingescape_agent()

def signal_handler(sig, frame):
    print("\n[System] Ctrl+C detected, exiting...")
    exit_event.set()
    sys.exit(0)

if __name__ == '__main__':
    signal.signal(signal.SIGINT, signal_handler)

    app, socketio = create_app()

    # ingescape_thread = threading.Thread(target=start_ingscape)
    # ingescape_thread.start()

    gss_client.connect()

    socket_service = SocketService(socketio)
    pilot_manager = PilotManager()
    pilot_stats = PilotStats(pilot_manager)

    general.pilot_stats = pilot_stats
    app.register_blueprint(general.general_bp)

    socket_manager = SocketManager(socket_service, pilot_manager)
    socket_manager.init_events()

    try:
        socketio.run(app, host="0.0.0.0", port=5321, use_reloader=False, allow_unsafe_werkzeug=True)
    except KeyboardInterrupt:
        pass
