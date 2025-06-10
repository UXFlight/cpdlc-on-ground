export const ALL_ACTIONS = {
    LOAD:    { id: 'load' },
    EXECUTE: { id: 'execute' },
    CANCEL:  { id: 'cancel-execute' },
    WILCO:   { id: 'wilco' },
    STANDBY: { id: 'standby' },
    UNABLE:  { id: 'unable' }
};


export const REQUEST_TYPE = {
    EXPECTED_TAXI_CLEARANCE: "expected_taxi_clearance",
    ENGINE_STARTUP: "engine_startup",
    PUSHBACK: 'pushback',
    TAXI_CLEARANCE: "taxi_clearance",
    DE_ICING: 'de_icing',
    VOICE_CONTACT: 'request_voice_contact',
}

export const LOADABLE_REQUEST_TYPES = ["expected_taxi_clearance", "taxi_clearance"];
