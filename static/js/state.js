export const stateFull = {
  messageCount: 0,
  currentRequest: null,
  steps: {
    expected_taxi_clearance: { status: null, message: null },
    engine_startup: { status: null, message: null },
    pushback: { status: null, message: null, direction: null },
    taxi_clearance: { status: null, message: null },
    de_icing: { status: null, message: null }
  }
};

export const state = {
  messageCount: 0,
  currentRequest: null,
  steps: {
    able_intersection_departure: { status: null, message: null },
    expected_taxi_clearance: { status: null, message: null },
    taxi_clearance: { status: null, message: null },
    ready_for_clearance: { status: null, message: null },
    departure_clearance: { status: null, message: null },
    engine_startup: { status: null, message: null },
    pushback: { status: null, message: null, direction: null },
    startup_cancellation: { status: null, message: null },
    request_voice_contact: { status: null, message: null }, // audio btn
    affirm: { status: null, message: null },
    negative: { status: null, message: null },
    roger: { status: null, message: null },
    we_can_accept: { status: null, message: null },
    we_cannot_accept: { status: null, message: null },
    de_icing: { status: null, message: null },
    de_icing_complete: { status: null, message: null },
    for_de_icing: { status: null, message: null },
    no_de_icing_required: { status: null, message: null },
  }
};


export const status = {
  CLOSED: 'closed', // success
  CANCELLED: 'cancelled',
  PENDING: 'pending',
  ERROR: 'error',
  LOAD: 'load', // will separate this in the future
  WILCO: 'wilco',
  STANDBY: 'standby',
  UNABLE: 'unable',
};
