from flask import Flask
from app.ingsvc import initialize_agent
from app.routes import all_blueprints

app = Flask(__name__)

for bp in all_blueprints:
    app.register_blueprint(bp)

if __name__ == '__main__':
        
    port = 5670
    agent_name = "Pilot_CPDLC_APP"
    device = "wlp0s20f3"

    agent = initialize_agent(agent_name, device, port)
    app.run(debug=False, host='0.0.0.0', port=5321)
