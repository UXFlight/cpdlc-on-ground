from typing import Optional
from flask import Blueprint, render_template
from app.managers import PilotManager
from app.classes.socket import SocketService

general_bp = Blueprint("general", __name__)
pilot_manager : Optional[PilotManager] = None
socket_service : Optional[SocketService] = None

@general_bp.route("/")
def index():
    request_overlays = [
        {"label": "Expected Taxi Clearance", "requestType": "DM_136"},
        {"label": "Engine Startup", "requestType": "DM_134"},
        {"label": "Pushback", "requestType": "DM_131", "type": "pushback"},
        {"label": "Taxi Clearance", "requestType": "DM_135"},
        {"label": "De-Icing", "requestType": "DM_127"},
    ]
    return render_template("index.html", request_overlays=request_overlays)
