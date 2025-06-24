import threading
class Step:
    def __init__(self, label, extra=None):
        self.label = label
        self.status = None
        self.message = None
        self.timestamp = None
        self.time_left = None
        self.request_id = None
        self.cancelled = False
        self.lock = threading.Lock()

        if extra:
            for k, v in extra.items():
                setattr(self, k, v)

    def to_dict(self): #* utils
        return {
            "label": self.label,
            "status": self.status,
            "message": self.message,
            "timestamp": self.timestamp,
            "timeLeft": self.time_left,
            "requestId": self.request_id,
            "cancelled": self.cancelled
        }