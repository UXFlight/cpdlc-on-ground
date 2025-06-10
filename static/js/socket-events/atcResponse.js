import { state, updateStep } from "../state/state.js";
import { appendToLog } from "../messages/historyLogs.js";
import { displayHistoryLogs } from "../events/filter.js";
import { playNotificationSound } from "../ui/ui.js";

export const handleAtcResponse = (data) => {
    console.log("ATC Response:", data.timeLeft);
    const cancelBtn = document.querySelector(`.cancel-button[data-requesttype="${data.requestType}"]`);
    if (cancelBtn) cancelBtn.disabled = true;
    updateStep(data.requestType, data.status, data.message,data.timestamp, data.timeLeft);
    playNotificationSound();
    displayHistoryLogs();
    if (data.requestType === "pushback") {
        const direction = data.direction;
        // document.getElementById(`pushback-${direction}`).disabled = true;
    }
}