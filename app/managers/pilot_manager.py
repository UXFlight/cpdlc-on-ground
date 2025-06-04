from app.classes.pilot.pilot import Pilot


class PilotManager:
    def __init__(self):
        self._pilots = {}

    def get_or_create(self, sid):
        if sid not in self._pilots:
            self._pilots[sid] = Pilot(sid)
        return self._pilots[sid]
