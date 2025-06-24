import json
from pathlib import Path

with open(Path(__file__).resolve().parent.parent.parent / "shared" / "msg_status.json") as f:
    MSG_STATUS = json.load(f)

INGESCAPE_OUTPUTS = {
    "load",
    "execute", 
    "cancel",
}

REQUEST_OUTPUTS = [
    "expected_taxi_clearance",
    "engine_startup",
    "taxi_clearance",
    "pushback",
    "de_icing",
    "able_intersection_departure",
    "ready_for_clearance",
    "departure_clearance",
    "startup_cancellation",
    "request_voice_contact",
    "affirm", "negative", "roger",
    "we_can_accept", "we_cannot_accept",
    "de_icing_complete",
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
        "message": lambda _: TAXI_CLEARANCE_MESSAGE,
        "requiredType": True,
        "allowedTypes": ["taxi_clearance", "expected_taxi_clearance"]
    },
    "cancel": {
        "status": "cancel",
        "message": lambda _: 'Clearance Cancelled',
        "requiredType": False,
        "fixedType": "taxi_clearance"
    },
    "wilco": {
        "status": "closed",
        "message": lambda req_type: TAXI_CLEARANCE_MESSAGE if req_type in ["taxi_clearance", "expected_taxi_clearance"] else "WILCO Acknowledged",
        "requiredType": True,
        "allowedTypes": REQUEST_OUTPUTS
    },
    "standby": {
        "status": "standby",
        "message": lambda req_type: TAXI_CLEARANCE_MESSAGE if req_type in ["taxi_clearance", "expected_taxi_clearance"] else "STANDBY - Awaiting ATC",
        "requiredType": True,
        "allowedTypes": REQUEST_OUTPUTS
    },
    "unable": {
        "status": "unable",
        "message": lambda req_type: TAXI_CLEARANCE_MESSAGE if req_type in ["taxi_clearance", "expected_taxi_clearance"] else "UNABLE to Comply",
        "requiredType": True,
        "allowedTypes": REQUEST_OUTPUTS
    }
}

TIMER_DURATION = 90

DEFAULT_ATC_RESPONSES = {
    "expected_taxi_clearance": "TAXI VIA C, C1, B, B1. HOLD SHORT OF RWY 24R.",
    "engine_startup": "STARTUP APPROVED. ADVISE WHEN READY FOR PUSHBACK.",
    "pushback": "PUSHBACK APPROVED.",
    "taxi_clearance": "TAXI VIA C, C1, B, B1 TO HOLD SHORT RWY 25R.",
    "de_icing": "DE-ICING NOT REQUIRED. CONTACT GROUND WHEN READY.",
    "request_voice_contact": "CONTACT GROUND ON 121.8 FOR FURTHER INSTRUCTIONS."
}

