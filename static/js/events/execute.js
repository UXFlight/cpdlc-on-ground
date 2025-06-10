import { state, updateStep } from '../state/state.js';
import { MSG_STATUS } from '../utils/consts/status.js';
import { postAction } from '../api/api.js';
import { updateTaxiClearanceMsg } from '../ui/ui.js';
import { getActionInfoFromEvent } from '../utils/utils.js';
import { enableWilcoButtons } from '../ui/buttons-ui.js';
import { setExecuteButtonState } from '../ui/buttons-ui.js';

export const executeEvent = async (e) => {
  e.stopPropagation();
  setExecuteButtonState(true);

  const { action, requestType } = getActionInfoFromEvent(e);
  if (!action || !requestType) return;

  const response = await postAction(action, requestType);
  const { ok, status, message, error } = response;

  if (!ok) {
    updateStep(requestType, MSG_STATUS.ERROR, error || `HTTP ${status}`);
    console.error("Execute error:", error);
    return;
  }

  if (message === null) return updateStep(requestType, MSG_STATUS.EXECUTED, "Execute confirmed, awaiting clearance...");

  enableWilcoButtons(requestType);
  updateTaxiClearanceMsg(message);
  updateStep(requestType, MSG_STATUS.EXECUTED, message);
};

export const cancelExecuteEvent = async (e) => {
  e.stopPropagation();
  setExecuteButtonState(true);

  const { action, requestType } = getActionInfoFromEvent(e);
  if (!action || !requestType) return;

  const response = await postAction(action, requestType);
  const { ok, status, message, error } = response;

  if (!ok) {
    updateStep(requestType, MSG_STATUS.ERROR, error || `HTTP ${status}`);
    console.error("Cancel error:", error);
    return;
  }

  const loadBtn = document.getElementById(`load-button-${requestType}`);
  if (loadBtn) loadBtn.disabled = false;

  updateTaxiClearanceMsg();
  updateStep(requestType, MSG_STATUS.CANCELLED, message || "Execute request cancelled");
};
