export const WORKFLOW_BUTTONS = {
    expected_taxi_clearance: {
    new: ['LOAD'],
    loaded: ['WILCO', 'STANDBY', 'UNABLE'],
    },
    taxi_clearance: {
    new: ['LOAD'],
    loaded: ['EXECUTE', 'CANCEL'],
    executed: ['WILCO', 'STANDBY', 'UNABLE'],
    cancelled: ['LOAD']
    },
    default: {
    NEW: ['WILCO', 'STANDBY', 'UNABLE']
    }
};