import ingescape as igs # type: ignore
from app.utils.constants import REQUEST_OUTPUTS, ACTION_OUTPUTS

class Echo:
    def __init__(self, pilot_id: str):
        self.pilot_id = pilot_id
        self._requests = {name: False for name in REQUEST_OUTPUTS}
        self._actions = {name: False for name in ACTION_OUTPUTS}
        self._register_outputs()

    ## PRIVATE ##
    def _prefixed(self, name: str) -> str:
        return f"{self.pilot_id}::{name}"

    def _register_outputs(self):
        for name in REQUEST_OUTPUTS:
            igs.output_create(self._prefixed(name), igs.BOOL_T, None)
        for name in ACTION_OUTPUTS:
            igs.output_create(self._prefixed(name), igs.BOOL_T, None)

    def _set_output(self, pool, name, value):
        if name not in pool:
            raise AttributeError(f"Unknown output '{name}'")
        pool[name] = value
        self._log_change(name, value)
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