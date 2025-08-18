from app.utils.types import AtcPublicView

class Atc:
    def __init__(self, atc_id: str):
        self.atc_id = atc_id
        self.selected_pilot: str = ''
    
    def to_public(self) -> AtcPublicView:
        return {
            "sid": self.atc_id,
            "selectedPilot": self.selected_pilot
        }
