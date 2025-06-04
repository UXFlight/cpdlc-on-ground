from flask import Flask  # type: ignore
from app.ingsvc import initialize_agent
from app.routes import all_blueprints
from app.socket.sockets import socket_manager

app = Flask(__name__)

for bp in all_blueprints:
    app.register_blueprint(bp)

socket_manager.init_app(app)

if __name__ == '__main__':
    port = 5670
    agent_name = "Pilot_CPDLC_APP"
    device = "wlp0s20f3"

    agent = initialize_agent(agent_name, device, port)
    socket_manager.run(app, host='0.0.0.0', port=5321)
