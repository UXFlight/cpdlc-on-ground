from typing import TYPE_CHECKING

from app.utils.types import PilotPublicView

if TYPE_CHECKING:
    from app.classes.pilot import Pilot

class PilotManager:
    def __init__(self):
        self._pilots: dict[str, "Pilot"] = {}

    def get(self, sid: str) -> "Pilot":
        if not self.exists(sid):
            raise KeyError(f"Pilot with SID {sid} does not exist.")
        return self._pilots[sid]

    def create(self, sid: str) -> PilotPublicView:
        from app.classes.pilot import Pilot
        if self.exists(sid):
            raise ValueError(f"Pilot with SID {sid} already exists.")
        self._pilots[sid] = Pilot(sid)
        return self._pilots[sid].to_public()

    def exists(self, sid: str) -> bool:
        return sid in self._pilots

    def remove(self, sid: str) -> None:
        pilot = self._pilots.pop(sid, None)
        if pilot:
            pilot.cleanup()

    def get_all_sids(self) -> list[str]:
        return list(self._pilots.keys())
    
    def get_all_pilots(self) -> list["Pilot"]:
        return list(self._pilots.values())
