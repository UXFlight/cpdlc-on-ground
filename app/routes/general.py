from typing import Optional
from flask import Blueprint, jsonify, request, current_app, render_template, send_file
from app.utils.constants import TIMER_DURATION
from app.utils.report_generator import generate_pdf_report
from app.utils.types import UpdateStepData
from app.managers.log_manager import logger
from app.managers import PilotManager, PilotStats
from app.classes.socket import SocketService

general_bp = Blueprint("general", __name__)
pilot_stats : Optional[PilotStats] = None 
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

@general_bp.route("/pilot/stats/report/<pilot_id>")
def get_stats_report(pilot_id: str):
    global pilot_stats
    if pilot_stats is None:
        return jsonify({"error": "Stats service unavailable"}), 500

    try:
        stats = pilot_stats.get_stats(pilot_id)
        pdf_stream = generate_pdf_report(pilot_id, stats)

        return send_file(
            pdf_stream,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=f"{pilot_id}_report.pdf"
        )
    except Exception as e:
        current_app.logger.exception(f"Error generating PDF for pilot {pilot_id}")
        return jsonify({"error": str(e)}), 500