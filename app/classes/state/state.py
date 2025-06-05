from app.utils.time_utils import get_current_timestamp
from app.utils.constants import ALL_OUTPUTS
from app.classes.state.step import Step

class PilotState:
    def __init__(self):
        self.history = []
        self.steps = self._init_steps()

    def _init_steps(self):
        step_defs = ALL_OUTPUTS  # ou une constante unique
        steps = {}

        for name in step_defs:
            extra = {"direction": None} if name == "pushback" else None
            steps[name] = Step(label=name.replace("_", " ").title(), extra=extra)
        return steps

    def _log_state(self, step_name):
        step = self.steps[step_name]
        self.history.append({
            "stepKey": step_name,
            "snapshot": step.to_dict()
        })

    ## PUBLIC
    def update_step(self, step_name, status, message=None, time_left=None):
        step = self.steps.get(step_name)
        if not step:
            return {"error": f"Unknown step: {step_name}"}

        self._log_state(step_name)

        step.status = status
        step.message = message
        step.timestamp = get_current_timestamp()
        step.time_left = time_left if status not in ("executed", "loaded", "timeout", "cancelled") else None


    def cancel_request(self, step_name):
        step = self.steps.get(step_name)
        if not step:
            return {"error": f"Unknown request: {step_name}"}
        if step.status != "requested":
            return {"error": f"Cannot cancel: current status is '{step.status}'"}

        step.status = "cancelled"
        step.message = "Request cancelled by pilot"
        step.timestamp = get_current_timestamp()
        step.cancelled = True

        return {
            "status": "cancelled",
            "requestType": step_name,
            "message": step.message,
            "timestamp": step.timestamp
        }


    def get_state(self):
        return {
            "steps": {k: s.to_dict() for k, s in self.steps.items()},
            "history": self.history
        }

    def reset(self):
        for name, step in self.steps.items():
            self._log_state(name)
            step.status = None
            step.message = None
            step.timestamp = None
            step.time_left = None
            step.cancelled = False
            if hasattr(step, "direction"):
                step.direction = None

    # debug
    def simulate_backend_action(self, step_name, status, message=None):
        return self.update_step(step_name, status, message)
