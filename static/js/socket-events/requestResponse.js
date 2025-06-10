import { state, updateStep } from "../state/state.js";
import { MSG_STATUS } from '../utils/consts/status.js';
import { showTick } from "../ui/ui.js";
import { displayHistoryLogs } from "../events/filter.js";

export const handleRequestAck = (data) => {
    const { requestType, status, message, timestamp } = data;
    const cancelBtn = document.querySelector(`.cancel-button[data-requesttype="${requestType}"]`);
    updateStep(requestType, status, message, timestamp);
    if (cancelBtn) cancelBtn.disabled = false;
    if (state.steps[requestType].status === MSG_STATUS.CANCELLED) return;
    displayHistoryLogs();
}