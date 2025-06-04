from flask import Blueprint, render_template # type: ignore

general_bp = Blueprint("general", __name__)

@general_bp.route("/")
def index():
    request_overlays = [
        {"number": 1, "label": "Expected Taxi Clearance", "requestType": "expected_taxi_clearance"},
        {"number": 2, "label": "Engine Startup", "requestType": "engine_startup"},
        {"number": 3, "label": "Pushback", "requestType": "pushback", "type": "pushback"},
        {"number": 4, "label": "Taxi Clearance", "requestType": "taxi_clearance"},
        {"number": 5, "label": "De-Icing", "requestType": "de_icing"},
        
        {"number": 6, "label": "Request Voice Contact", "requestType": "request_voice_contact"},
        {"number": 7, "label": "Roger", "requestType": "roger"},
        {"number": 8, "label": "Departure Clearance", "requestType": "departure_clearance"},
        {"number": 9, "label": "Ready for Clearance", "requestType": "ready_for_clearance"},
        {"number": 10, "label": "Able Intersection Departure", "requestType": "able_intersection_departure"},
        {"number": 11, "label": "Affirm", "requestType": "affirm"},
        {"number": 12, "label": "Negative", "requestType": "negative"},
        {"number": 13, "label": "We Can Accept", "requestType": "we_can_accept"},
        {"number": 14, "label": "We Cannot Accept", "requestType": "we_cannot_accept"},
        {"number": 15, "label": "Startup Cancellation", "requestType": "startup_cancellation"},
        {"number": 16, "label": "For De-Icing", "requestType": "for_de_icing"},
        {"number": 17, "label": "De-Icing Complete", "requestType": "de_icing_complete"},
        {"number": 18, "label": "No De-Icing Required", "requestType": "no_de_icing_required"},
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