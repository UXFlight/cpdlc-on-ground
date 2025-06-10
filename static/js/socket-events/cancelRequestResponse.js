import { displayHistoryLogs } from "../events/filter.js";
import { updateStep } from "../state/state.js";
import { updateDirection } from "../state/state.js";

export const handleCancelRequest = (data) => {
    const { requestType, status, message, timestamp } = data;
    const requestBtn = document.querySelector(`.request-button[data-requesttype="${requestType}"]`);
    
    if (requestBtn) requestBtn.disabled = false;
    if (requestType === "pushback") {
        if (requestBtn) requestBtn.disabled = true;
        ["pushback-left", "pushback-right"].forEach(id => document.getElementById(id).disabled = false);
        updateDirection();

    }
    updateStep(requestType, status, message, timestamp);
    displayHistoryLogs();
}