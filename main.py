import threading
import signal
import sys
import mimetypes
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from app.classes.socket import SocketService
from app.managers import PilotManager, SocketManager, PilotStats
from app.routes import general

exit_event = threading.Event()

def create_app():
    mimetypes.add_type('application/javascript', '.js')
    app = Flask(__name__, static_url_path="/static", static_folder="static")
    CORS(app)
    socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")
    return app, socketio

def signal_handler(sig, frame):
    print("\n[System] Ctrl+C detected, exiting...")
    exit_event.set()
    sys.exit(0)

if __name__ == '__main__':
    signal.signal(signal.SIGINT, signal_handler)

    app, socketio = create_app()

    import logging
    logging.getLogger('werkzeug').setLevel(logging.ERROR)

    socket_service = SocketService(socketio)
    pilot_manager = PilotManager()
    pilot_stats = PilotStats(pilot_manager)

    general.pilot_stats = pilot_stats
    general.pilot_manager = pilot_manager
    general.socket_service = socket_service
    app.register_blueprint(general.general_bp)

    socket_manager = SocketManager(socket_service, pilot_manager)
    socket_manager.init_events()

    try:
        host = "0.0.0.0"
        port = 5321
        print(f"[SERVER] Server running at http://localhost:{port}")
        socketio.run(app, host="0.0.0.0", port=5321, use_reloader=False, allow_unsafe_werkzeug=True)
    except KeyboardInterrupt:
        pass
