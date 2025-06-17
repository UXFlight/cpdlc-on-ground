import { updateStep } from "../state/state.js";
import { displayHistoryLogs } from "../events/filter.js";
import { playNotificationSound } from "../ui/ui.js";
import { getBool, CONFIG_KEYS } from "../state/configState.js";
import { MSG_STATUS } from "../utils/consts/status.js";
import { REQUEST_TYPE } from "../utils/consts/flightConsts.js";
import { autoLoadAction } from "../events/action.js";
import { closeOverlay } from "../events/overlay.js";

export const handleAtcResponse = (data) => {
    const cancelBtn = document.querySelector(`.cancel-button[data-requesttype="${data.requestType}"]`);
    if (cancelBtn) cancelBtn.disabled = true;

    closeOverlay(data.requestType);

    updateStep(data.requestType, data.status, data.message,data.timestamp, data.timeLeft);

    if (checkAutoLoad(data)) setTimeout(() => autoLoadAction(data.requestType), 600);
    if (getBool(CONFIG_KEYS.AUDIO)) playNotificationSound();

    displayHistoryLogs();
    if (data.requestType === "pushback") {
        const direction = data.direction;
        // document.getElementById(`pushback-${direction}`).disabled = true;
    }
}

function checkAutoLoad(data) {
    const isLoadable = [REQUEST_TYPE.EXPECTED_TAXI_CLEARANCE, REQUEST_TYPE.TAXI_CLEARANCE].includes(data.requestType);
    return data.status === MSG_STATUS.NEW && isLoadable && getBool(CONFIG_KEYS.ACK);
}