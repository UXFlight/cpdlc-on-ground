import { updateStep } from "../state/state.js";
import { MSG_STATUS } from '../utils/consts/status.js';
import { closeCurrentOverlay } from "../utils/utils.js";
import { displayHistoryLogs } from "../events/filter.js";
import { enableButtonsByAction } from "../ui/buttons-ui.js";
import { updateTaxiClearanceMsg } from "../ui/ui.js";
import { REQUEST_TYPE } from "../utils/consts/flightConsts.js";

export function handleActionResponse(data) {
    const { requestType, status, message, action, timestamp, timeLeft } = data;
    updateStep(requestType, status, message, timestamp, timeLeft);
    displayHistoryLogs();
    enableButtonsByAction(action, requestType);

    if (action === MSG_STATUS.LOAD || action === MSG_STATUS.EXECUTE || action === MSG_STATUS.CANCEL) {
        updateTaxiClearanceMsg(requestType === REQUEST_TYPE.EXPECTED_TAXI_CLEARANCE, action !== MSG_STATUS.CANCEL ? message : '');
    }
    closeCurrentOverlay();
}