from dataclasses import dataclass
from enum import Enum
from typing import Optional, TypedDict


class StepStatus(Enum):
    IDLE = "idle"
    REQUESTED = "requested"
    NEW = "new"
    LOADED = "loaded"
    EXECUTED = "executed"
    CANCELLED = "cancelled"
    CLOSED = "closed"
    STANDBY = "standby"
    UNABLE = "unable"
    CANCEL = "cancel"
    TIMEOUT = "timeout"
    ERROR = "error"

class StepCode(Enum):
    EXPECTED_TAXI_CLEARANCE = "DM_136"
    ENGINE_STARTUP = "DM_134"
    PUSHBACK = "DM_131"
    TAXI_CLEARANCE = "DM_135"
    DE_ICING = "DM_127"
    VOICE_CONTACT = "DM_20"

class StepUpdatePayload(TypedDict):
    pilot_sid: str
    step_code: str
    label: str
    status: str
    message: str
    validated_at: float
    request_id: str
    time_left: Optional[float]


class AckUpdatePayload(TypedDict):
    step_code: str
    status: str
    message: str
    validated_at: float
    time_left: Optional[float]
    label: str

@dataclass
class UpdateStepData:
    pilot_sid: str
    step_code: str
    label: str
    status: StepStatus
    message: str
    validated_at: float
    request_id: str
    time_left: Optional[float] = None

    def to_dict(self) -> StepUpdatePayload:
        return {
            "pilot_sid": self.pilot_sid,
            "step_code": self.step_code,
            "label": self.label or self.step_code,
            "status": self.status.value,
            "message": self.message,
            "validated_at": self.validated_at,
            "request_id": self.request_id,
            "time_left": self.time_left,
        }

    def to_ack_payload(self) -> AckUpdatePayload:
        return {
            "step_code": self.step_code,
            "status": self.status.value,
            "message": self.message,
            "validated_at": self.validated_at,
            "time_left": self.time_left,
            "label": self.label
        }

    @staticmethod
    def from_dict(data: dict) -> Optional["UpdateStepData"]:
        try:
            return UpdateStepData(
                pilot_sid=data["pilot_sid"],
                step_code=data["step_code"],
                label=data.get("label", data["step_code"]),
                status=StepStatus(data["status"]),
                message=data["message"],
                validated_at=data["validated_at"],
                request_id=data["request_id"],
                time_left=data.get("time_left"),
            )
        except KeyError as e:
            print(f"[PARSE] ❌ Missing key in update_step: {e}")
            return None


class SocketErrorPayload(TypedDict):
    requestType: Optional[str]
    status: str
    message: str
    timestamp: float


class SocketError(TypedDict):
    event: str
    payload: SocketErrorPayload


class SocketRequestAckPayload(TypedDict):
    event: str
    payload: StepUpdatePayload


class GssConnectInfo(TypedDict):
    facility: str
    connectedSince: str



@dataclass
class StepEvent:
    status: StepStatus
    timestamp: float
    message: str = ''