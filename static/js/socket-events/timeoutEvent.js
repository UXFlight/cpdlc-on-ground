import { state } from "../state/state.js";
import { updateTimerVisual } from "../ui/timer-ui.js";


export const tickUpdate = ({ timeLeft, requestType }) => {
    const step = state.steps[requestType];
    if (!step) return;

    step.timeLeft = timeLeft;

    updateTimerVisual(requestType, timeLeft); 
};



export const timeoutEvent = (data) => {
    console.log("Timeout Event:", data);
    const { requestType, message } = data;

}