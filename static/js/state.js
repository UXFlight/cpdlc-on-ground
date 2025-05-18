export const state = {
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

export const status = {
  SUCCESS: 'success',
  ERROR: 'error',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  LOAD: 'load',
  WILCO: 'wilco',
  STANDBY: 'standby',
  UNABLE: 'unable',
};