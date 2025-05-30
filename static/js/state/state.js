// Global state
export const state = {
  currentRequest: null,
  isFiltered: true, // used to filter history logs
  history: [], // history logs
  connection: {
    backend: "connecting",   // "connecting" | "connected" | "disconnected"
    atc: {
      status : "pending", // "pending" | "connected" | "disconnected"
      facility: null, 
    },
  },
  steps: {
    able_intersection_departure: createStep("Able Intersection Departure"),
    expected_taxi_clearance: createStep("Expected Taxi Clearance"),
    taxi_clearance: createStep("Taxi Clearance"),
    ready_for_clearance: createStep("Ready for Clearance"),
    departure_clearance: createStep("Departure Clearance"),
    engine_startup: createStep("Engine Startup"),
    pushback: createStep("Pushback", { direction: null }),
    startup_cancellation: createStep("Startup Cancellation"),
    request_voice_contact: createStep("Request Voice Contact"), 
    affirm: createStep("Affirm"),
    negative: createStep("Negative"),
    roger: createStep("Roger"),
    we_can_accept: createStep("We Can Accept"),
    we_cannot_accept: createStep("We Cannot Accept"),
    de_icing: createStep("De-Icing"),
    de_icing_complete: createStep("De-Icing Complete"),
    for_de_icing: createStep("For De-Icing"),
    no_de_icing_required: createStep("No De-Icing Required")
  },
};

function createStep(label, extra = {}) {
  return {
    label,
    status: null,
    message: null,
    timestamp: null,
    ...extra
  };
}

export function updateStep(newStatus, newMessage = null) {
  const key = state.currentRequest;
  const step = state.steps[key];
  if (!step) return;

  const entry = {
    status: newStatus,
    message: newMessage,
    timestamp: new Date().toISOString().replace('T', ' ').split('.')[0]
  };

  step.status = newStatus;
  step.message = newMessage;
  step.timestamp = entry.timestamp;

  // grouping by request type
  let group = state.history.find(h => h.stepKey === key);
  if (!group) {
    group = { stepKey: key, label: step.label, entries: [] };
    state.history.push(group);
  }
  group.entries.push(entry);
}



export function updateDirection(direction) {
  state.steps["pushback"].direction = direction;
}


export const status = {
  CLOSED: 'closed', // success
  CANCELLED: 'cancelled',
  NEW: 'new',
  ERROR: 'error',
  LOAD: 'load', // will separate this in the future
  WILCO: 'wilco',
  STANDBY: 'standby',
  UNABLE: 'unable',
  EXECUTED: 'executed',
};
