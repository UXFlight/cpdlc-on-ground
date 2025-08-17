import { updateStep } from "../state/state.js";
import { MSG_STATUS } from '../utils/consts/status.js';
import { closeCurrentOverlay } from "../utils/utils.js";
import { displayHistoryLogs } from "../events/filter.js";
import { enableButtonsByStatus } from "../ui/buttons-ui.js";
import { updateTaxiClearanceMsg } from "../ui/ui.js";
import { REQUEST_TYPE } from "../utils/consts/flightConsts.js";

export function handleActionResponse(data) {
    const { step_code, status, message, validated_at, time_left } = data;
    updateStep(step_code, status, message, validated_at, time_left);
    displayHistoryLogs();
    enableButtonsByStatus(status, step_code);

    if ([MSG_STATUS.LOADED, MSG_STATUS.EXECUTED, MSG_STATUS.CANCEL].includes(status)) {
        updateTaxiClearanceMsg(step_code === REQUEST_TYPE.EXPECTED_TAXI_CLEARANCE, status !== MSG_STATUS.CANCEL ? message : '');
    }
    closeCurrentOverlay();
}