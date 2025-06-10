import { updateDirection, updateStep } from '../state/state.js';
import { MSG_STATUS } from '../utils/consts/status.js';
import { getRequestTypeFromEvent } from "../utils/utils.js";
import { emitCancelRequest } from "../socket/socket-emits.js";
import { REQUEST_TYPE } from '../utils/consts/flightConsts.js';
import { state } from '../state/state.js';

export async function cancelRequestEvent(e) {
  e.stopPropagation();
  const requestType = getRequestTypeFromEvent(e);
  if (!requestType) return;

  const isActive = [MSG_STATUS.REQUESTED, MSG_STATUS.NEW, MSG_STATUS.STANDBY, MSG_STATUS.UNABLE]
                      .includes(state.steps[REQUEST_TYPE.PUSHBACK].status);
                      
  if (requestType === REQUEST_TYPE.PUSHBACK && !isActive) {
    document.getElementById('pushback-btn').disabled = true;
    this.disabled = true;
    updateDirection();
    ["pushback-left", "pushback-right"].forEach(id => document.getElementById(id).disabled = false);
    return 
  }

  try {
    emitCancelRequest(requestType);
    this.disabled = true;
  } catch (err) {
    console.error("Cancel error:", err);
    updateStep(requestType, MSG_STATUS.ERROR, "Network error during cancellation");
  }
}