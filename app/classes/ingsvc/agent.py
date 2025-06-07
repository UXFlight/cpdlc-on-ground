import ingescape as igs # type: ignore
import sys
import signal
from app.utils.constants import REQUEST_OUTPUTS, ACTION_OUTPUTS

class Echo:
    def __init__(self, pilot_id: str):
        self.pilot_id = pilot_id
        self._requests = {name: False for name in REQUEST_OUTPUTS}
        self._actions = {name: False for name in ACTION_OUTPUTS}
        self._register_outputs()
        self._register_callbacks()

    ## PRIVATE ##
    def _prefixed(self, name: str) -> str:
        return f"{self.pilot_id}::{name}"

    def _register_outputs(self):
        for name in REQUEST_OUTPUTS:
            igs.output_create(self._prefixed(name), igs.BOOL_T, None)
        for name in ACTION_OUTPUTS:
            igs.output_create(self._prefixed(name), igs.BOOL_T, None)

    def _register_callbacks(self):
        igs.observe_agent_events(self.on_agent_event_callback, self)
        igs.observe_freeze(self.on_freeze_callback, self)
        igs.observe_input("reset", self.reset_callback, self)
        # signal.signal(signal.SIGINT, self.signal_handler)

    ## CALLBACKS ##
    def on_agent_event_callback(event, uuid, name, event_data, my_data):
        print(event, uuid, name, event_data)
        agent_object = my_data
        assert isinstance(agent_object, Echo)
        # add code here if needed
        # log_event(self.pilot_id, "AGENT_EVENT", f"{event} from {name} ({uuid}) → {event_data}")

    def on_freeze_callback(my_data):
        agent_object = my_data
        assert isinstance(agent_object, Echo)
        # add code here if needed
        # log_event(self.pilot_id, "FREEZE", "Ingescape freeze callback triggered")

    def reset_callback(my_data):
        igs.info(f"Output reset")
        agent_object = my_data
        assert isinstance(agent_object, Echo)
        # log_event(self.pilot_id, "RESET", "System reset via Ingescape callback")    
        agent_object.reset() # reset the agent state
        # pilot_state.reset() # reset the pilot state

    def signal_handler(signal_received, frame):
        print("\n", signal.strsignal(signal_received), sep="")
        print("\nExiting the app...")
        sys.exit(0)

    def _set_output(self, pool, name, value):
        if name not in pool:
            raise AttributeError(f"Unknown output '{name}'")
        pool[name] = value
        igs.output_set_bool(self._prefixed(name), value)

    ## PUBLIC ##
    def set_request(self, name, value: bool):
        self._set_output(self._requests, name, value)

    def set_action(self, name, value: bool):
        self._set_output(self._actions, name, value)

    def reset(self):
        for name in self._requests:
            self.set_request(name, False)
        for name in self._actions:
            self.set_action(name, False)