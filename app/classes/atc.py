from typing import Optional

class Atc:
    def __init__(self, atc_id: str):
        self.atc_id = atc_id
        self.selected_pilot: Optional[str] = None

    def join_room(self, room_id: str) -> None:
        self.selected_pilot = room_id

    def leave_room(self) -> None:
        self.selected_pilot = None

    def is_in_room(self, room_id: str) -> bool:
        return self.selected_pilot == room_id
    
    def to_dict(self) -> dict:
        return {
            "sid": self.atc_id,
            "selectedPilot": self.selected_pilot
        }
