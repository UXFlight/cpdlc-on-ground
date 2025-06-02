
import { state, updateStep } from '../state/state.js';
import { MSG_STATUS } from '../state/status.js';
import { showSpinner, showTick } from '../ui/ui.js';
import { disableCancelButtons } from '../ui/buttons-ui.js';
import { postAction } from '../api/api.js';
import { filterHistoryLogs } from './filter.js';
import { closeCurrentOverlay } from '../utils/utils.js';

// willco, standby, unable event
export const actionEvent = async (e, action, status) => {
  e.stopPropagation();
  if (!status) return;

  showSpinner(action);
  //? Disable all buttons
  try {
    const data = await postAction(status, state.currentRequest);
    if (data.error) {
      console.warn(`Server error on '${action}':`, data.error);
      showTick(action, true);
      updateStep(MSG_STATUS.ERROR, data.error);
      filterHistoryLogs(); //!!!!! wth
      return;
    }
    updateStep(data.status, data.message);
    filterHistoryLogs();
    if (status !== MSG_STATUS.WILCO) {
      const clearanceMessageBox = document.querySelector(".taxi-clearance-box");
      clearanceMessageBox.classList.remove("active");
      disableCancelButtons(state.currentRequest);
    }
    showTick(state.currentRequest,  data.status !== MSG_STATUS.CLOSED);
    closeCurrentOverlay();

  } catch (err) {
    console.error(`Error handling action '${action}'`, err);
    showTick(action, true);
  }
}

