from datetime import datetime


def current_timestamp():
    return datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")


def create_step(label, extra=None):
    step = {
        "label": label,
        "status": None,
        "message": None,
        "timestamp": None,
        "history": []
    }
    if extra:
        step.update(extra)
    return step

class PilotState:
    def __init__(self):
        self.message_count = 0
        self.current_request = None
        self.steps = {
            "able_intersection_departure": create_step("Able Intersection Departure"),
            "expected_taxi_clearance": create_step("Expected Taxi Clearance"),
            "taxi_clearance": create_step("Taxi Clearance"),
            "ready_for_clearance": create_step("Ready for Clearance"),
            "departure_clearance": create_step("Departure Clearance"),
            "engine_startup": create_step("Engine Startup"),
            "pushback": create_step("Pushback", {"direction": None}),
            "startup_cancellation": create_step("Startup Cancellation"),
            "request_voice_contact": create_step("Request Voice Contact"),
            "affirm": create_step("Affirm"),
            "negative": create_step("Negative"),
            "roger": create_step("Roger"),
            "we_can_accept": create_step("We Can Accept"),
            "we_cannot_accept": create_step("We Cannot Accept"),
            "de_icing": create_step("De-Icing"),
            "de_icing_complete": create_step("De-Icing Complete"),
            "for_de_icing": create_step("For De-Icing"),
            "no_de_icing_required": create_step("No De-Icing Required")
        }

    def update_step(self, step_name, status, message=None):
        step = self.steps.get(step_name)
        if not step:
            return

        # Add previous state to history
        step["history"].append({
            "status": step["status"],
            "message": step["message"],
            "timestamp": step["timestamp"]
        })

        step["status"] = status
        step["message"] = message
        step["timestamp"] = current_timestamp()

    def update_pushback_direction(self, direction):
        if "pushback" in self.steps:
            self.steps["pushback"]["direction"] = direction

    def reset(self):
        for step in self.steps.values():
            step["history"].append({
                "status": step["status"],
                "message": step["message"],
                "timestamp": step["timestamp"]
            })
            step["status"] = None
            step["message"] = None
            step["timestamp"] = None
            if "direction" in step:
                step["direction"] = None

        self.message_count = 0
        self.current_request = None
