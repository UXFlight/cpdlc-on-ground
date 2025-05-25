// Global state
export const state = {
  messageCount: 0,
  currentRequest: null,
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
  }
};

export function updateStep(newStatus, newMessage = null) {
  console.log(state.steps[state.currentRequest]);
  const step = state.steps[state.currentRequest];
  if (!step) return;

  step.history.push({
    status: step.status,
    message: step.message,
    timestamp: step.timestamp
  });

  step.status = newStatus;
  step.message = newMessage;
  step.timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
}

export function updateDirection(direction) {
  state.steps["pushback"].direction = direction;
}

function createStep(label, extra = {}) {
  return {
    label,
    status: null,
    message: null,
    timestamp: null,
    history: [],
    ...extra
  };
}

export const status = {
  CLOSED: 'closed', // success
  CANCELLED: 'cancelled',
  PENDING: 'pending',
  ERROR: 'error',
  LOAD: 'load', // will separate this in the future
  WILCO: 'wilco',
  STANDBY: 'standby',
  UNABLE: 'unable',
  EXECUTED: 'executed',
};
