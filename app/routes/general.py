# app/routes/general.py

from flask import Blueprint, render_template, jsonify
from datetime import datetime

general_bp = Blueprint("general", __name__)

@general_bp.route("/")
def index():
    return render_template("index.html")

@general_bp.route("/log", methods=["GET"])
def log_action():
    response = {
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "message": "ATC has acknowledged your log request. Proceed with actions.",
    }
    return jsonify(response)

@general_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "OK", "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")})
