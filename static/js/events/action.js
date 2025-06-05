import { updateStep } from '../state/state.js';
import { MSG_STATUS } from '../state/status.js';
import { showSpinner, showTick } from '../ui/ui.js';
import { disableCancelButtons } from '../ui/buttons-ui.js';
import { filterHistoryLogs } from './filter.js';
import { closeCurrentOverlay, getActionInfoFromEvent } from '../utils/utils.js';
import { emitAction } from '../socket/socket-emits.js';

export const actionEvent = async (e) => {
  e.stopPropagation();

  const { action, requestType } = getActionInfoFromEvent(e);
  if (!action || !requestType) return;

  const requestBtn = document.getElementById(`${requestType.replace(/_/g, "-")}-btn`);
  showSpinner(requestType);

  emitAction(action, requestType);
  try {
    // const { ok, status, message, error } = response;

    // if (!ok) {
    //   console.warn(`Server error on '${action}':`, status, error);
    //   showTick(requestType, true);
    //   updateStep(requestType, MSG_STATUS.ERROR, error || `Server error`, requestType);
    //   filterHistoryLogs();
    //   return;
    // }

    // updateStep(requestType, status, message, requestType);
    // filterHistoryLogs();

    // if (action !== MSG_STATUS.WILCO) {
    //   const clearanceMessageBox = document.querySelector(".taxi-clearance-box");
    //   if (clearanceMessageBox) clearanceMessageBox.classList.remove("active");
    //   disableCancelButtons(requestType);
    //   requestBtn.disabled = false;
    // }

    // showTick(requestType, status !== MSG_STATUS.CLOSED);
    // closeCurrentOverlay();

  } catch (err) {
    console.error(`Error handling action '${action}':`, err);
    showTick(requestType, true);
    updateStep(requestType, MSG_STATUS.ERROR, "Network or unexpected error", requestType);
  }
};
