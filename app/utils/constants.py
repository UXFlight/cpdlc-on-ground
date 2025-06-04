import json
from pathlib import Path

with open(Path(__file__).resolve().parent.parent.parent / "shared" / "msg_status.json") as f:
    MSG_STATUS = json.load(f)


REQUEST_OUTPUTS = [
    "able_intersection_departure",
    "expected_taxi_clearance",
    "taxi_clearance",
    "ready_for_clearance",
    "departure_clearance",
    "engine_startup",
    "pushback",
    "startup_cancellation",
    "request_voice_contact",
    "affirm", "negative", "roger",
    "we_can_accept", "we_cannot_accept",
    "de_icing", "de_icing_complete",
    "for_de_icing", "no_de_icing_required"
]

ACTION_OUTPUTS = [
    "load", 
    "wilco", 
    "execute", 
    "cancel", 
    "standby", 
    "unable"
]

ALL_OUTPUTS = REQUEST_OUTPUTS + ACTION_OUTPUTS

DEFAULT_ATC_RESPONSES = {
    "expected_taxi_clearance": "TAXI VIA C, C1, B, B1. HOLDSHORT RWY 24R",
    "engine_startup": "ENGINE STARTUP APPROVED",
    "pushback": "PUSHBACK APPROVED",
    "taxi_clearance": "TAXI CLEARANCE GRANTED",
    "de_icing": "DE-ICING NOT REQUIRED"
}

TAXI_CLEARANCE_MESSAGE = "TAXI VIA C, C1, B, B1, RWY 25R"
INVALID_DATA_ERROR = "Invalid data"

ACTION_DEFINITIONS = {
    "execute": {
        "status": "executed",
        "message": lambda _: TAXI_CLEARANCE_MESSAGE,
        "requiredType": True,
        "allowedTypes": ["taxi_clearance"]
    },
    "load": {
        "status": "loaded",
        "message": lambda rt: DEFAULT_ATC_RESPONSES.get(rt, "LOAD OK"),
        "requiredType": True,
        "allowedTypes": ["taxi_clearance", "expected_taxi_clearance"]
    },
    "cancel": {
        "status": "cancelled",
        "message": lambda _: None,
        "requiredType": False,
        "fixedType": "taxi_clearance"
    },
    "wilco": {
        "status": "closed",
        "message": lambda _: "WILCO acknowledged",
        "requiredType": True,
        "allowedTypes": REQUEST_OUTPUTS
    },
    "standby": {
        "status": "standby",
        "message": lambda _: "STANDBY - Awaiting ATC",
        "requiredType": True,
        "allowedTypes": REQUEST_OUTPUTS
    },
    "unable": {
        "status": "unable",
        "message": lambda _: "UNABLE to comply",
        "requiredType": True,
        "allowedTypes": REQUEST_OUTPUTS
    }
}

TIMER_DURATION = 90  # en secondes
