import { updateStep } from "../state/state.js";
import { MSG_STATUS } from '../utils/consts/status.js';
import { closeCurrentOverlay } from "../utils/utils.js";
import { filterHistoryLogs } from "../events/filter.js";
import { enableButtonsByAction } from "../ui/buttons-ui.js";
import { updateTaxiClearanceMsg, updateTaxiClearanceStatus } from "../ui/ui.js";

export function handleActionResponse(data) {
    console.log("Action response received:", data);
    const { requestType, status, message, action, timestamp, timeLeft } = data;
    updateStep(requestType, status, message, timestamp, timeLeft);
    filterHistoryLogs();
    enableButtonsByAction(action, requestType);

    if (action === MSG_STATUS.LOAD || action === MSG_STATUS.EXECUTE) {
        updateTaxiClearanceMsg(message);
        updateTaxiClearanceStatus(action, status);
    }

    // if (action !== MSG_STATUS.WILCO) {
    //   const clearanceMessageBox = document.querySelector(".taxi-clearance-box");
    //   if (clearanceMessageBox) clearanceMessageBox.classList.remove("active");
    //   disableCancelButtons(requestType);
    //   requestBtn.disabled = false;
    // }

    // showTick(requestType, status !== MSG_STATUS.CLOSED);
    closeCurrentOverlay();
}