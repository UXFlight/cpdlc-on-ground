import { state, updateStep } from "../state/state.js";
import { MSG_STATUS } from "../state/status.js";
import { showTick } from "../ui/ui.js";
import { filterHistoryLogs } from "../events/filter.js";

export const handleRequestAck = (data) => {
    const { requestType, status, message, timestamp } = data;

    const cancelBtn = document.querySelector(`.cancel-button[data-requesttype="${requestType}"]`);

    console.log(data)
    // if (response.error || !response.status) {
    //   showTick(requestType, true);
    //   closeCurrentOverlay();
    //   if (cancelBtn) cancelBtn.disabled = true;
    //   updateStep(requestType, MSG_STATUS.ERROR, response.error || "Request failed");
    //   return;
    // }

    updateStep(requestType, status, message, timestamp);
    if (cancelBtn) cancelBtn.disabled = false;
    if (state.steps[requestType].status === MSG_STATUS.CANCELLED) return;
    showTick(requestType);
    filterHistoryLogs();
}