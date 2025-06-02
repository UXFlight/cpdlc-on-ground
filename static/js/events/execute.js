import { state, updateStep } from '../state/state.js';
import { MSG_STATUS } from '../state/status.js';
import { postAction } from '../api/api.js';
import { updateTaxiClearanceMsg } from '../ui/ui.js';
import { getActionInfoFromEvent } from '../utils/utils.js';

// execute event
export const executeEvent = async (e) => {
  e.stopPropagation();
  const info = getActionInfoFromEvent(e);
  if (!info) return;
  console.log("Execute event info:", info);
  const data = await postAction(info.actionType, info.requestType);

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

export const cancelExecuteEvent = async (e) => { //! for now, clearing taxi clearance and enabling load btn
  e.stopPropagation();
  const info = getActionInfoFromEvent(e);
  if (!info) return;

  const data = await postAction(info.actionType, info.requestType);

  if (data.error) {
    updateStep(MSG_STATUS.ERROR, data.error);
    console.error("Cancel error:", data.error);
    return;
  }

  const loadBtn = document.getElementById(`load-button-${info.requestType}`);
  if (loadBtn) loadBtn.disabled = false;

  updateTaxiClearanceMsg();
  updateStep(MSG_STATUS.CANCELLED, data.message || "Execute request cancelled");
};
