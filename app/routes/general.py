from flask import Blueprint, render_template # type: ignore

general_bp = Blueprint("general", __name__)

@general_bp.route("/")
def index():
    request_overlays = [
        {"label": "Expected Taxi Clearance", "requestType": "expected_taxi_clearance"},
        {"label": "Engine Startup", "requestType": "engine_startup"},
        {"label": "Pushback", "requestType": "pushback", "type": "pushback"},
        {"label": "Taxi Clearance", "requestType": "taxi_clearance"},
        {"label": "De-Icing", "requestType": "de_icing"},
        {"label": "Voice Contact", "requestType": "request_voice_contact"},
    ]
    return render_template("index.html", request_overlays=request_overlays)