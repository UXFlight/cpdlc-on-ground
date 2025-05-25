# coding: utf-8

import ingescape as igs


class Singleton(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]

class Echo(metaclass=Singleton):
    def __init__(self):
        self.boolI = None
        self.exp_t_c = None
        self.t_c = None

        self._outputs = {
            "requests": {
                "Expected_Taxi_Clearance": False,
                "Engine_Startup": False,
                "Pushback": False,
                "Taxi_Clearance": False,
                "De_Icing": False
            },
            "actions": {
                "Load": False,
                "Wilco": False,
                "Execute": False,
                "Cancel": False,
                "Standby": False,
                "Unable": False
            }
        }

    def _set_output(self, category, name, value):
        if category in self._outputs and name in self._outputs[category]:
            self._outputs[category][name] = value
            if value is not None:
                igs.output_set_bool(name, value)
        else:
            raise AttributeError(f"Output '{name}' not found in category '{category}'.")

    # Public interface
    def set_request(self, name, value):
        self._set_output("requests", name, value)

    def set_action(self, name, value):
        self._set_output("actions", name, value)

    def get_output(self, name):
        for category in self._outputs.values():
            if name in category:
                return category[name]
        raise AttributeError(f"No such output '{name}'")

    def __getattr__(self, name):
        return self.get_output(name)

    def receive_values(self, sender_agent_name, sender_agent_uuid, boolV, integer, double, string, data, token, my_data):
        igs.info(f"Service receive_values called by {sender_agent_name} ({sender_agent_uuid}) with argument_list {boolV, integer, double, string, data} and token '{token}'")

    def send_values(self, sender_agent_name, sender_agent_uuid, token, my_data):
        print(f"Sending values to {sender_agent_name} ({sender_agent_uuid}), token: {token}")
        igs.info(sender_agent_uuid, "receive_values",
                 (self.boolI, 0, 0.0, "", b""), token)
