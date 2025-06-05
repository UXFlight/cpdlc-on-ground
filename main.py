from flask import Flask # type: ignore
from flask_socketio import SocketIO # type: ignore
from app.managers.pilot_manager import PilotManager
from app.classes.socket.socket import SocketService
from app.managers.socket_manager import SocketManager
from app.routes.general import general_bp

def create_app():
    app = Flask(__name__)
    app.register_blueprint(general_bp)
    socketio = SocketIO(app, cors_allowed_origins="*")
    return app, socketio

if __name__ == '__main__':
    app, socketio = create_app()

    socket_service = SocketService(socketio)
    pilot_manager = PilotManager()
    socket_manager = SocketManager(socket_service, pilot_manager)

    socket_manager.init_events()

    socketio.run(app, host="0.0.0.0", port=5321)

