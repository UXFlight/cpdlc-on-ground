import { updateStep } from '../state/state.js';
import { MSG_STATUS } from "../state/status.js";
import { postAction } from "../api/api.js";
import { updateTaxiClearanceMsg } from '../ui/ui.js';
import { getActionInfoFromEvent } from '../utils/utils.js';
import { enableExecuteButtons, enableWilcoButtons } from '../ui/buttons-ui.js';

export async function loadEvent(e) {
  const info = getActionInfoFromEvent(e);
  if (!info) return;

  e.stopPropagation();

  try {
    const data = await postAction(info.actionType, info.requestType);

    if (data.error) {
      console.error("Load error:", data.error);
      return;
    }

    if (data.message === null) return;

    updateTaxiClearanceMsg(data.message);
    updateStep(MSG_STATUS.LOADED, data.message);
    
    this.disabled = true;
    if (info.requestType === "taxi_clearance") {
      enableExecuteButtons(info.requestType);
    } else {
      enableWilcoButtons(info.requestType);
    }

  } catch (err) {
    console.error("Network error:", err);
    updateStep(MSG_STATUS.ERROR, err.message || "Network error during load");
    alert("Error communicating with server.");
  }
}