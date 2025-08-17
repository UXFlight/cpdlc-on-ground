import { displayHistoryLogs } from "../events/filter.js";
import { updateStep } from "../state/state.js";
import { togglePushbackState } from "../ui/buttons-ui.js";
import { hideSpinner } from "../ui/ui.js";
import { REQUEST_TYPE } from "../utils/consts/flightConsts.js";

export const handleCancelRequest = (data) => {
    const { step_code, status, message, time_left } = data;
    const requestBtn = document.querySelector(`.request-button[data-requesttype="${step_code}"]`);

    if (requestBtn) requestBtn.disabled = false;
    if (step_code === REQUEST_TYPE.PUSHBACK) {
        togglePushbackState(true);
    }
    hideSpinner(step_code);
    updateStep(step_code, status, message, null, time_left);
    displayHistoryLogs();
}