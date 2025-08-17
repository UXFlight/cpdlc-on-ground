from typing import Optional
from flask import Blueprint, jsonify, request, current_app, render_template, send_file
from app.classes.gss_client import GSSClient
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
gss_client : Optional[GSSClient] = None

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
    
@general_bp.route("/step-update", methods=["POST"])
def step_update():
    global pilot_manager, socket_service
    if pilot_manager is None or socket_service is None:
        return jsonify({"error": "Pilot manager not initialized"}), 500
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid payload"}), 400

    try:
        update = UpdateStepData.from_dict(data)
        if not update:
            return jsonify({"error": "Invalid step format"}), 400

        if update.status.value == "new":
            update.time_left = TIMER_DURATION
            
        pilot = pilot_manager.get(update.pilot_sid)
        if not pilot:
            return jsonify({"error": "Pilot not found"}), 404

        pilot.handle_step_update(update)
        logger.log_request(update.pilot_sid, "new", f"Received step update for {update.step_code}")
        
        socket_service.send("atcResponse", {
            "step_code": update.step_code,
            "status": update.status.value,
            "message": update.message,
            "timestamp": update.validated_at,
            "time_left": update.time_left,
        }, room=pilot.sid)
        
        if update.status.value == "new" and gss_client:
            pilot.start_timer_for_step(update.step_code, socket_service, gss_client)
        
        return jsonify({"message": "Step updated successfully"}), 200

    except Exception as e:
        current_app.logger.exception("Failed to process step update")
        return jsonify({"error": str(e)}), 500