import { displayHistoryLogs } from "../events/filter.js";
import { state, updateStep } from "../state/state.js";
import { updateTimerVisual } from "../ui/timer-ui.js";
import { getBool, CONFIG_KEYS } from "../state/configState.js";
import { autoSendRequest } from "../events/sendRequest.js";
import { enableRequestButton } from "../ui/buttons-ui.js";
import { MSG_STATUS } from "../utils/consts/status.js";


export const tickUpdate = ({ timeLeft, requestType }) => {
    const step = state.steps[requestType];
    if (!step) return;

    const total = step.status === MSG_STATUS.STANDBY ? 300 : 90;
    step.timeLeft = timeLeft;

    updateTimerVisual(requestType, timeLeft, total); 
};

export const timeoutEvent = (data) => {
    const { 
            message,
            requestType,
            status,
            timeLeft,
            timestamp
        } = data;

    updateStep(requestType, status, message, timestamp, timeLeft);
    displayHistoryLogs();
    enableRequestButton(requestType)

    if (getBool(CONFIG_KEYS.RETRY)) autoSendRequest(requestType);
}