from flask import Blueprint, jsonify, render_template, current_app, send_file
from app.utils.report_generator import generate_pdf_report

general_bp = Blueprint("general", __name__)
pilot_stats = None 

@general_bp.route("/")
def index():
    request_overlays = [
        {"label": "Expected Taxi Clearance", "requestType": "expected_taxi_clearance"},
        {"label": "Engine Startup", "requestType": "engine_startup"},
        {"label": "Pushback", "requestType": "pushback", "type": "pushback"},
        {"label": "Taxi Clearance", "requestType": "taxi_clearance"},
        {"label": "De-Icing", "requestType": "de_icing"},
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