from datetime import datetime, timezone
from app.constants import MSG_STATUS

def current_timestamp():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

def create_step(label, extra=None):
    step = {
        "label": label,
        "status": None,
        "message": None,
        "timestamp": None,
        "timeLeft": None
    }
    if extra:
        step.update(extra)
    return step


class PilotState:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init_state()
        return cls._instance

    def _init_state(self):
        self.history = []
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

    def update_step(self, step_name, status, message=None, time_left=None):
        step = self.steps.get(step_name)
        if not step:
            return

        timestamp = current_timestamp()
        self.history.append({
            "stepKey": step_name,
            "label": step["label"],
            "status": step.get("status"),
            "message": step.get("message"),
            "timestamp": step.get("timestamp"),
            "timeLeft": step.get("timeLeft")
        })

        step["status"] = status
        step["message"] = message
        step["timestamp"] = timestamp

        if time_left is not None:
            step["timeLeft"] = time_left

        if status in ("executed", "loaded", "timeout", "cancelled"):
            step["timeLeft"] = None


    def update_pushback_direction(self, direction): #! have to validate if good direction
        self.steps["pushback"]["direction"] = direction

    def reset(self):
        for step_name, step in self.steps.items():
            self.history.append({
                "stepKey": step_name,
                "label": step["label"],
                "status": step.get("status"),
                "message": step.get("message"),
                "timestamp": step.get("timestamp"),
            })
            step["status"] = None
            step["message"] = None
            step["timestamp"] = None
            step["timeLeft"] = None
            if "direction" in step:
                step["direction"] = None

    def get_state(self):
        return {
            "ok": True,
            "steps": self.steps,
            "history": self.history 
        }

    def cancel_request(self, step_name):
        step = self.steps.get(step_name)
        if not step:
            return {"error": f"Unknown request: {step_name}"}
        if step["status"] != "requested":
            return {"error": f"Cannot cancel: current status is '{step['status']}'"}

        step["status"] = "cancelled"
        step["message"] = "Request cancelled by pilot"
        step["timestamp"] = current_timestamp()
        step["cancelled"] = True

        return {
            "status": "cancelled",
            "requestType": step_name,
            "message": step["message"],
            "timestamp": step["timestamp"]
        }
    
    def simulate_backend_action(self, step_name, status, message=None):
        """
        Fonction interne si pour simuler une action simple
        Ne pas utiliser dans la logique métier du service.
        """
        if step_name not in self.steps:
            return {"error": f"Unknown step: {step_name}"}

        self.update_step(step_name, status, message)
        return {
            "status": status,
            "message": message,
            "stepKey": step_name,
            "state": self.get_state()
        }
    