from typing import TYPE_CHECKING

from app.utils.types import PilotPublicView, Plane
from app.managers.airport_map_manager import AirportMapManager

if TYPE_CHECKING:
    from app.classes.pilot import Pilot

class PilotManager:
    def __init__(self, airport_map_manager : AirportMapManager):
        self._pilots: dict[str, "Pilot"] = {}
        self.airport_map_manager = airport_map_manager

    def get(self, sid: str) -> "Pilot":
        if not self.exists(sid):
            raise KeyError(f"Pilot with SID {sid} does not exist.")
        return self._pilots[sid]

    def create(self, sid: str) -> PilotPublicView:
        from app.classes.pilot import Pilot
        if self.exists(sid):
            raise ValueError(f"Pilot with SID {sid} already exists.")

        plane : Plane = self.airport_map_manager.simulate_plane() # simulate pilot position
        self._pilots[sid] = Pilot(sid, plane=plane)
        return self._pilots[sid].to_public()

    def exists(self, sid: str) -> bool:
        return sid in self._pilots

    def remove(self, sid: str) -> None:
        pilot = self._pilots.pop(sid, None)
        if pilot:
            pilot.cleanup()

    def get_all_pilots(self) -> list["Pilot"]:
        return list(self._pilots.values())
