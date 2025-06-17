# from flask import Blueprint, request, jsonify # type: ignore
# from app.services.action_service import process_action

# action_bp = Blueprint("action", __name__)

# @action_bp.route("/action", methods=["POST"])
# def handle_action():
#     data = request.get_json()
#     action = data.get("action")
#     request_type = data.get("requestType")

#     if not action:
#         return jsonify({"error": "Missing action"}), 400

#     result = process_action(action, request_type)
#     if "error" in result:
#         return jsonify(result), 400
#     return jsonify(result)
