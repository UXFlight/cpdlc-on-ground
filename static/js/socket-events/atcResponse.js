import { state, updateStep } from "../state/state.js";
import { appendToLog } from "../messages/historyLogs.js";
import { filterHistoryLogs } from "../events/filter.js";
import { playNotificationSound } from "../ui/ui.js";

export const handleAtcResponse = (data) => {
    const cancelBtn = document.querySelector(`.cancel-button[data-requesttype="${data.requestType}"]`);
    if (cancelBtn) cancelBtn.disabled = true;
    updateStep(data.requestType, data.status, data.message,data.timestamp, data.timeLeft);
    playNotificationSound();
    if(state.isFiltered) return appendToLog(data.requestType, data.message, data.timestamp, data.status);
    state.isFiltered = true;
    filterHistoryLogs();
    if (data.requestType === "pushback") {
        const direction = data.direction;
        // document.getElementById(`pushback-${direction}`).disabled = true;
    }
}