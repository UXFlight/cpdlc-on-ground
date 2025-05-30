
import { state, updateStep } from '../state/state.js';
import { MSG_STATUS } from '../state/status.js';
import { showSpinner, showTick } from '../ui/ui.js';
import { disableActionButtons, disableAllButtons, disableCancelButtons, enableAllRequestButtons } from '../ui/buttons-ui.js';
import { postAction } from '../api/api.js';
import { updateMessageStatus, createHistoryLog } from '../messages/historyLogs.js';

// willco, standby, unable event
export const actionEvent = async (action, e) => {
  e.stopPropagation();
  if (!action) return;

  showSpinner(action);
  //? Disable all buttons
  disableActionButtons(MSG_STATUS.LOAD); 
  disableActionButtons(MSG_STATUS.WILCO);

  try {

    const currentRequest = state.steps[state.currentRequest];
    const data = await postAction(action);
    if (!data.error) {
      currentRequest.status = action === MSG_STATUS.WILCO ? MSG_STATUS.CLOSED : action;
      currentRequest.message = data.message; // recheck this //? saving server response but for what ?
      createHistoryLog(data);
      updateMessageStatus(state.currentRequest, currentRequest.status);
      updateStep(currentRequest.status, currentRequest.message);
      if (action === MSG_STATUS.WILCO) {
        disableAllButtons(state.currentRequest);
        showTick(state.currentRequest);
      } else {
        const clearanceMessageBox = document.querySelector(".taxi-clearance-box");
        clearanceMessageBox.classList.remove("active");
        disableCancelButtons(state.currentRequest);
        showTick(state.currentRequest, true)
      }
    } else {
      console.warn(`Server error on '${action}'`, data.error);
      showTick(action, true);
    }
  } catch (err) {
    console.error(`Error handling action '${action}'`, err);
    showTick(action, true);
  }
}

