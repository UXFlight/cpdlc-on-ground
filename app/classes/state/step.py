# represents a single step (request message DM.XX/UM.XX)
class Step:
    def __init__(self, label, extra=None):
        self.label = label
        self.status = None
        self.message = None
        self.timestamp = None
        self.time_left = None
        self.cancelled = False

        if extra:
            for k, v in extra.items():
                setattr(self, k, v)

    def to_dict(self):
        return {
            "label": self.label,
            "status": self.status,
            "message": self.message,
            "timestamp": self.timestamp,
            "timeLeft": self.time_left,
            "cancelled": self.cancelled
        }
