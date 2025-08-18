from dataclasses import dataclass, field
from typing import Optional, List
import threading
from app.utils.types import StepEvent, StepPublicView, StepStatus, UpdateStepData


@dataclass
class Step:
    step_code: str
    label: str
    request_id: str = ""
    status: StepStatus = StepStatus.IDLE
    message: str = ""
    timestamp: float = 0.0
    validated_at: float = 0.0
    time_left: Optional[float] = None

    # === Internal state
    history: List[StepEvent] = field(default_factory=list)
    lock: threading.Lock = field(default_factory=threading.Lock, repr=False)
    
    # === Apply update and add to history
    def apply_update(self, update: UpdateStepData) -> None:
        with self.lock:
            self.status = update.status
            self.message = update.message
            self.timestamp = update.validated_at
            self.validated_at = update.validated_at
            self.request_id = update.request_id
            self.time_left = update.time_left

            # Save event in step history
            self.history.append(StepEvent(
                step_code=update.step_code,
                status=update.status.value,
                timestamp=update.validated_at,
                message=update.message
            ))

    # === Manual history entry (optional use)
    def add_history(self, update: UpdateStepData) -> None:
        with self.lock:
            self.history.append(StepEvent(
                step_code=update.step_code,
                status=update.status.value,
                timestamp=update.validated_at,
                message=update.message
            ))

    # === Reset step to initial state
    def reset(self) -> None:
        with self.lock:
            self.status = StepStatus.IDLE
            self.message = ""
            self.timestamp = 0.0
            self.validated_at = 0.0
            self.request_id = ""
            self.time_left = None
            self.history.clear()

    # === UI representation
    def to_dict(self) -> dict:
        return {
            "step_code": self.step_code,
            "label": self.label,
            "status": self.status.value,
            "message": self.message,
            "timestamp": self.timestamp,
            "validated_at": self.validated_at,
            "request_id": self.request_id,
            "time_left": self.time_left
        }
        
    def to_step_public_view(self) -> StepPublicView:
        return {
            "step_code": self.step_code,
            "label": self.label,
            "status": self.status.value,
            "message": self.message,
            "validated_at": self.validated_at,
            "time_left": self.time_left
        }

    # === Init from UpdateStepData
    @staticmethod
    def from_update(update: UpdateStepData) -> "Step":
        return Step(
            step_code=update.step_code,
            label=update.label,
            status=update.status,
            message=update.message,
            timestamp=update.validated_at,
            validated_at=update.validated_at,
            request_id=update.request_id,
            time_left=update.time_left
        )
