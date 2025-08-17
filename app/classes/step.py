from dataclasses import dataclass, field
from typing import Optional, List
import threading
from app.utils.types import StepEvent, StepStatus, UpdateStepData


@dataclass
class Step:
    step_code: str
    label: str
    status: StepStatus = StepStatus.IDLE
    message: Optional[str] = ""
    timestamp: Optional[float] = None
    validated_at: Optional[float] = None
    request_id: str = ""
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
                status=update.status,
                timestamp=update.validated_at,
                message=update.message
            ))

    # === Manual history entry (optional use)
    def add_history(self, update: UpdateStepData) -> None:
        with self.lock:
            self.history.append(StepEvent(
                status=update.status,
                timestamp=update.validated_at,
                message=update.message
            ))

    # === Reset step to initial state
    def reset(self) -> None:
        with self.lock:
            self.status = StepStatus.IDLE
            self.message = ""
            self.timestamp = None
            self.validated_at = None
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

    # === Init from GSS StepPublicView
    @staticmethod
    def from_public_view(data: dict) -> "Step":
        return Step(
            step_code=data["step_code"],
            label=data["label"],
            status=StepStatus(data["status"]),
            message=data.get("message", ""),
            timestamp=data.get("timestamp"),
            validated_at=data.get("validated_at"),
            request_id=data.get("request_id", ""),
            time_left=data.get("time_left")
        )

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
