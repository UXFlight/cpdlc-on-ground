import { checkPendingRequest, blockSecondRequest } from "../utils.js";
import { state, status } from '../state.js';
import { showSpinner, showTick } from "../ui.js";
import { createLog } from "../messages.js";
import { disableActionButtons, enableButtons, disableCancelButtons } from "../buttons-ui.js";
import { sendRequest } from '../api.js'
import { closeCurrentOverlay } from "../utils.js";

export const sendRequestEvent = async (action) => { // !bug : can spam request/ cancel and creates multiple requests
  if (invalidRequest(action)) return;
  
  state.steps[action].status = status.PENDING; // change status to pending asap
  const cancelBtn = document.querySelector(`.cancel-button[data-action="${action}"]`);

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
      // showTick(action);
      enableButtons(action);
    } else {
      showTick(action, true)
      closeCurrentOverlay();
      disableCancelButtons(action);
      state.steps[action].status = status.ERROR;
    }

  } catch (err) {
    showTick(action, true)
    closeCurrentOverlay();
    state.steps[action].status = status.ERROR;
    console.error("Network error:", err);
  }
}

function invalidRequest(action) {
    return (!action || checkPendingRequest() || blockSecondRequest(action) || action === "pushback" && !state.steps[action].direction)
}