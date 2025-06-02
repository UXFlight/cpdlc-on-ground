import { sendRequest } from '../api/api.js'
import { showSpinner, showTick } from "../ui/ui.js";
import { closeCurrentOverlay, getLatestEntry, invalidRequest } from "../utils/utils.js";
import { state, updateStep } from '../state/state.js';
import { MSG_STATUS } from '../state/status.js';
import { disableCancelButtons, disableAllRequestButtons } from "../ui/buttons-ui.js";
import { filterHistoryLogs } from './filter.js';

export const sendRequestEvent = async (action) => {
  if (invalidRequest(action)) return;
  const cancelBtn = document.querySelector(`.cancel-button[data-action="${action}"]`);
  
  updateStep(MSG_STATUS.REQUESTED); //! change status to NEW asap : still frontend only, will work on ws later
  showSpinner(action);
  disableAllRequestButtons();

  try {
    if (cancelBtn) cancelBtn.disabled = false;
    const data = await sendRequest(action);
    if (state.steps[action].status === MSG_STATUS.CANCELLED) return; // if cancelled, do not proceed //! will send request to server
    if (!data.error) {
      const lastestEntry = getLatestEntry(action);
      lastestEntry.message = data.message; //! temp, will check logic later
      lastestEntry.status = data.status
      filterHistoryLogs();
    } else {
      showTick(action, true);
      closeCurrentOverlay();
      disableCancelButtons(action);
      updateStep(MSG_STATUS.ERROR, data.message);
    }
  } catch (err) {
    showTick(action, true)
    closeCurrentOverlay();
    updateStep(MSG_STATUS.ERROR, err)
    console.error("Network error:", err);
  }
}