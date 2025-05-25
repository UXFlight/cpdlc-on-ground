import { sendRequest } from '../api/api.js'
import { showSpinner, showTick } from "../ui/ui.js";
import { createLog } from "../messages/messages.js";
import { closeCurrentOverlay } from "../utils/utils.js";
import { state, status, updateStep } from '../state/state.js';
import { checkPendingRequest, blockSecondRequest } from "../utils/utils.js";
import { disableActionButtons, enableButtons, disableCancelButtons } from "../ui/buttons-ui.js";

export const sendRequestEvent = async (action) => { // !bug : can spam request/ cancel and creates multiple requests
  if (invalidRequest(action)) return;
  const cancelBtn = document.querySelector(`.cancel-button[data-action="${action}"]`);
  
  updateStep(status.PENDING); // change status to pending asap

  showSpinner(action);
  disableActionButtons(status.LOAD);
  disableActionButtons(status.WILCO);

  try {
    if (cancelBtn) cancelBtn.disabled = false;
    const data = await sendRequest(action);
    if (state.steps[action].status === status.CANCELLED) return; // if cancelled, do not proceed // might send request to server
    if (!data.error) {
      state.steps[action].message = data.message;
      createLog(data);
      enableButtons(action);
    } else {
      showTick(action, true)
      closeCurrentOverlay();
      disableCancelButtons(action);
      updateStep(status.ERROR, data.message)
    }
  } catch (err) {
    showTick(action, true)
    closeCurrentOverlay();
    updateStep(status.ERROR, err)
    console.error("Network error:", err);
  }
}

function invalidRequest(action) {
    return (!action || checkPendingRequest() || blockSecondRequest(action) || action === "pushback" && !state.steps[action].direction)
}