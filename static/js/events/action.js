import { updateStep } from '../state/state.js';
import { MSG_STATUS } from '../state/status.js';
import { showSpinner, showTick } from '../ui/ui.js';
import { disableCancelButtons } from '../ui/buttons-ui.js';
import { postAction } from '../api/api.js';
import { filterHistoryLogs } from './filter.js';
import { closeCurrentOverlay, getActionInfoFromEvent } from '../utils/utils.js';

export const actionEvent = async (e) => {
  e.stopPropagation();

  const info = getActionInfoFromEvent(e);
  if (!info) return;

  const { actionType, requestType } = info;
  if (!actionType || !requestType) return;

  showSpinner(requestType);

  try {
    const data = await postAction(actionType, requestType);

    if (data.error) {
      console.warn(`Server error on '${actionType}':`, data.error);
      showTick(requestType, true);
      updateStep(MSG_STATUS.ERROR, data.error, requestType);
      filterHistoryLogs();
      return;
    }

    updateStep(data.status, data.message, requestType);
    filterHistoryLogs();

    if (actionType !== MSG_STATUS.WILCO) {
      const clearanceMessageBox = document.querySelector(".taxi-clearance-box");
      if (clearanceMessageBox) clearanceMessageBox.classList.remove("active");
      disableCancelButtons(requestType);
    }

    showTick(requestType, data.status !== MSG_STATUS.CLOSED);
    closeCurrentOverlay();

  } catch (err) {
    console.error(`Error handling action '${actionType}'`, err);
    showTick(requestType, true);
  }
};
