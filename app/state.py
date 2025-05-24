class PilotState:
    def __init__(self):
        self.current_request = None
        self.steps = {
            "pushback": {"status": None, "message": None, "direction": None},
        }

    def update_step(self, step, status, message=None):
        self.steps[step]["status"] = status
        self.steps[step]["message"] = message
