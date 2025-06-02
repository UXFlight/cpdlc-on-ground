from flask import Blueprint, render_template # type: ignore

general_bp = Blueprint("general", __name__)

@general_bp.route("/")
def index():
    request_overlays = [
        {"number": 1, "label": "Expected Taxi Clearance", "action": "expected_taxi_clearance"},
        {"number": 2, "label": "Engine Startup", "action": "engine_startup"},
        {"number": 3, "label": "Pushback", "action": "pushback", "type": "pushback"},
        {"number": 4, "label": "Taxi Clearance", "action": "taxi_clearance"},
        {"number": 5, "label": "De-Icing", "action": "de_icing"},
        
        {"number": 6, "label": "Request Voice Contact", "action": "request_voice_contact"},
        {"number": 7, "label": "Roger", "action": "roger"},
        {"number": 8, "label": "Departure Clearance", "action": "departure_clearance"},
        {"number": 9, "label": "Ready for Clearance", "action": "ready_for_clearance"},
        {"number": 10, "label": "Able Intersection Departure", "action": "able_intersection_departure"},
        {"number": 11, "label": "Affirm", "action": "affirm"},
        {"number": 12, "label": "Negative", "action": "negative"},
        {"number": 13, "label": "We Can Accept", "action": "we_can_accept"},
        {"number": 14, "label": "We Cannot Accept", "action": "we_cannot_accept"},
        {"number": 15, "label": "Startup Cancellation", "action": "startup_cancellation"},
        {"number": 16, "label": "For De-Icing", "action": "for_de_icing"},
        {"number": 17, "label": "De-Icing Complete", "action": "de_icing_complete"},
        {"number": 18, "label": "No De-Icing Required", "action": "no_de_icing_required"},
    ]
    action_groups = [
        {
            "group_class": "load-grp",
            "buttons": [
                {"id": "load-button", "label": "Load", "extra_class": ""},
                {"id": "execute-button", "label": "Execute", "extra_class": ""},
                {"id": "cancel-execute-button", "label": "Cancel", "extra_class": "cancel"}
            ]
        },
        {
            "group_class": "wilco-grp",
            "buttons": [
                {"id": "wilco", "label": "Wilco", "extra_class": ""},
                {"id": "standby", "label": "Standby", "extra_class": ""},
                {"id": "unable", "label": "Unable", "extra_class": "cancel"}
            ]
        }
    ]
    return render_template("index.html", action_groups=action_groups, request_overlays=request_overlays)