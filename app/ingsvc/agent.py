from datetime import datetime
import ingescape as igs # type: ignore

class Singleton(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]

class Echo(metaclass=Singleton):
    def __init__(self):
        self._history = [] # keeps logs of actions and requests
        self._requests = {
            "able_intersection_departure": False,
            "expected_taxi_clearance": False,
            "taxi_clearance": False,
            "ready_for_clearance": False,
            "departure_clearance": False,
            "engine_startup": False,
            "pushback": False,
            "startup_cancellation": False,
            "request_voice_contact": False,
            "affirm": False,
            "negative": False,
            "roger": False,
            "we_can_accept": False,
            "we_cannot_accept": False,
            "de_icing": False,
            "de_icing_complete": False,
            "for_de_icing": False,
            "no_de_icing_required": False
        }

        self._actions = {
            "load": False,
            "wilco": False,
            "execute": False,
            "cancel": False,
            "standby": False,
            "unable": False
        }

    @property
    def requests(self):
        return self._requests

    @property
    def actions(self):
        return self._actions
    
    def _log_change(self, name, value):
        self._history.append((name, value, datetime.utcnow().isoformat()))

    def _set_output(self, pool, name, value):
        self._log_change(name, value)
        if name in pool:
            pool[name] = value
            if value is not None:
                igs.output_set_bool(name, value)
        else:
            raise AttributeError(f"Output '{name}' not found.")

    # public interface
    def set_request(self, name, value):
        self._set_output(self._requests, name, value)

    def set_action(self, name, value):
        self._set_output(self._actions, name, value)

    def get_output(self, name):
        if name in self._requests:
            return self._requests[name]
        if name in self._actions:
            return self._actions[name]
        raise AttributeError(f"No such output '{name}'")

    def __getattr__(self, name):
        return self.get_output(name)

    def reset(self):
        for name in self._requests:
            self.set_request(name, False)
        for name in self._actions:
            self.set_action(name, False)
        igs.info("[Echo] All outputs reset.")
        #! send reset impulse 

    def get_history(self):
        return getattr(self, "_history", [])
