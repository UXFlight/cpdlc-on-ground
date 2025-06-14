from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.classes.pilot.pilot import Pilot

class PilotManager:
    def __init__(self):
        self._pilots: dict[str, "Pilot"] = {}

    def get_or_create(self, sid: str) -> "Pilot":
        if sid not in self._pilots:
            from app.classes.pilot.pilot import Pilot
            self._pilots[sid] = Pilot(sid)
        return self._pilots[sid]

    def remove(self, sid: str) -> None:
        pilot = self._pilots.pop(sid, None)
        if pilot:
            pilot.cleanup()
