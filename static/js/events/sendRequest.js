import { sendRequest } from '../api/api.js'
import { showSpinner, showTick } from "../ui/ui.js";
import { appendToLog, createHistoryLog, playNotificationSound } from "../messages/historyLogs.js";
import { closeCurrentOverlay, getLatestEntry, invalidRequest } from "../utils/utils.js";
import { state, status, updateStep } from '../state/state.js';
import { disableActionButtons, enableButtons, disableCancelButtons, disableAllRequestButtons } from "../ui/buttons-ui.js";

export const sendRequestEvent = async (action) => {
  if (invalidRequest(action)) return;
  const cancelBtn = document.querySelector(`.cancel-button[data-action="${action}"]`);
  
  updateStep(status.PENDING); //! change status to pending asap : still frontend only, will work on ws later

  showSpinner(action);
  disableActionButtons(status.LOAD);
  disableActionButtons(status.WILCO);
  disableAllRequestButtons();

  try {
    if (cancelBtn) cancelBtn.disabled = false;
    const data = await sendRequest(action);
    if (state.steps[action].status === status.CANCELLED) return; // if cancelled, do not proceed //! will send request to server
    if (!data.error) {
      const lastestEntry = getLatestEntry(action);
      lastestEntry.message = data.message; //! temp, will check logic later
      state.isFiltered ? 
          appendToLog(
                state.currentRequest, 
                data.message, 
                data.timestamp
              )
          : createHistoryLog(
            { 
              action, 
              timestamp : data.timestamp, 
              message : data.message
            });
      playNotificationSound();
      enableButtons(action);
    } else {
      showTick(action, true);
      closeCurrentOverlay();
      disableCancelButtons(action);
      updateStep(status.ERROR, data.message);
    }
  } catch (err) {
    showTick(action, true)
    closeCurrentOverlay();
    updateStep(status.ERROR, err)
    console.error("Network error:", err);
  }
}