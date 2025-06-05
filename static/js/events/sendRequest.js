import { sendRequest } from '../api/api.js'
import { showSpinner, showTick } from "../ui/ui.js";
import { closeCurrentOverlay, getLatestEntry, getRequestTypeFromEvent, invalidRequest } from "../utils/utils.js";
import { state, updateStep } from '../state/state.js';
import { MSG_STATUS } from '../state/status.js';
import { filterHistoryLogs } from './filter.js';
import { emitRequest } from '../socket/socket-emits.js';

export async function sendRequestEvent(e) {
  e.preventDefault();
  e.stopPropagation();
  this.disabled = true;

  const requestType = getRequestTypeFromEvent(e);
  if (!requestType || invalidRequest(requestType)) return;

  const cancelBtn = document.querySelector(`.cancel-button[data-requesttype="${requestType}"]`);

  showSpinner(requestType);

  try {
    // const response = await sendRequest(requestType);
    emitRequest(requestType); 

    // if (response.error || !response.status) {
    //   showTick(requestType, true);
    //   closeCurrentOverlay();
    //   if (cancelBtn) cancelBtn.disabled = true;
    //   updateStep(requestType, MSG_STATUS.ERROR, response.error || "Request failed");
    //   return;
    // }

    // updateStep(requestType, MSG_STATUS.REQUESTED, "Request sent to ATC");
    // if (cancelBtn) cancelBtn.disabled = false;
    // if (state.steps[requestType].status === MSG_STATUS.CANCELLED) return;
    // showTick(requestType);

    // const latestEntry = getLatestEntry(requestType);
    // latestEntry.message = response.message || "Request acknowledged";
    // latestEntry.status = response.status || MSG_STATUS.REQUESTED;

    // filterHistoryLogs();

  } catch (err) {
    showTick(requestType, true);
    closeCurrentOverlay();
    updateStep(requestType, MSG_STATUS.ERROR, err.message || "Network error");
    console.error("Network error:", err);
  }
};
