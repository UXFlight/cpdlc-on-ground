import multiprocessing
from flask import Flask  # type: ignore
from flask_socketio import SocketIO  # type: ignore
from app.routes.general import general_bp
from app.classes.socket.socket import SocketService
from app.managers import PilotManager, SocketManager
from app.classes.ingsvc.agent import Echo

def create_app():
    app = Flask(__name__)
    app.register_blueprint(general_bp)
    socketio = SocketIO(app, cors_allowed_origins="*")
    return app, socketio

def start_ingscape():
    Echo.start_ingescape_agent()

if __name__ == '__main__':
    app, socketio = create_app()

    ingescape_process = multiprocessing.Process(target=start_ingscape) #! will see hope it turns out
    ingescape_process.start()

    socket_service: SocketService = SocketService(socketio)
    pilot_manager: PilotManager = PilotManager()
    socket_manager: SocketManager = SocketManager(socket_service, pilot_manager)
    socket_manager.init_events()

    try:
        socketio.run(app, host="0.0.0.0", port=5321, use_reloader=False, allow_unsafe_werkzeug=True)
    finally:
        ingescape_process.terminate()
        ingescape_process.join()
