import { state, updateStep } from '../state/state.js';
import { MSG_STATUS } from '../state/status.js';
import { postAction } from '../api/api.js';
import { updateTaxiClearanceMsg } from '../ui/ui.js';

// execute event
export const executeEvent = async (e) => {
  e.stopPropagation();
  if (!state.currentRequest) return;

  const data = await postAction(MSG_STATUS.EXECUTE, state.currentRequest);

  if (data.error) {
    updateStep(MSG_STATUS.ERROR, data.error)
    console.error("Execute error:", data.error);
    return;
  }

  if (data.message === null) { //! what to do when no taxi clearance sent by ATC ? waiting on it ? timeout ?
    updateStep(MSG_STATUS.EXECUTED, "Execute confirmed, awaiting clearance...");
    return;
  }

  updateTaxiClearanceMsg(data.message);
  updateStep(MSG_STATUS.EXECUTED, data.message)
}

export const cancelExecuteEvent = async (e, action) => { //! for now, clearing taxi clearance and enabling load btn
  e.stopPropagation();

  if (!state.currentRequest || action !== state.currentRequest) return;

  const data = await postAction(MSG_STATUS.CANCEL, action);

  if (data.error) {
    updateStep(MSG_STATUS.ERROR, data.error);
    console.error("Cancel error:", data.error);
    return;
  }

  const loadBtn = document.getElementById(`load-button-${action}`);
  if (loadBtn) loadBtn.disabled = false;

  updateTaxiClearanceMsg();
  updateStep(MSG_STATUS.CANCELLED, data.message || "Execute request cancelled");
};
