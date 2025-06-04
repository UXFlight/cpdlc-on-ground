import { updateStep } from '../state/state.js';
import { MSG_STATUS } from "../state/status.js";
import { postAction } from "../api/api.js";
import { updateTaxiClearanceMsg } from '../ui/ui.js';
import { getActionInfoFromEvent } from '../utils/utils.js';
import { setExecuteButtonState, enableWilcoButtons } from '../ui/buttons-ui.js';

export async function loadEvent(e) {
  e.stopPropagation();
  const { action, requestType } = getActionInfoFromEvent(e);
  if (!action || !requestType) return;

  try {
    const response = await postAction(action, requestType);
    const { ok, status, message, error } = response;

    if (!ok) {
      console.error("Load error:", error || `HTTP ${status}`);
      updateStep(requestType, MSG_STATUS.ERROR, error || `Load failed (status ${status})`);
      return;
    }

    if (message === null) {
      updateStep(requestType, MSG_STATUS.LOADED, "Loaded, awaiting ATC clearance...");
      return;
    }

    updateTaxiClearanceMsg(message);
    updateStep(requestType, MSG_STATUS.LOADED, message);

    if (e.target && e.target.disabled !== undefined) {
      e.target.disabled = true;
    }

    if (requestType === "taxi_clearance") {
      setExecuteButtonState();
    } else {
      enableWilcoButtons(requestType);
    }

  } catch (err) {
    console.error("Network error:", err);
    updateStep(requestType, MSG_STATUS.ERROR, err.message || "Network error during load");
    alert("Error communicating with server.");
  }
}
