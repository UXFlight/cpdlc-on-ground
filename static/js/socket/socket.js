import { state } from "../state/state.js";
import { enableButtons } from "../ui/buttons-ui.js";


const socket = io("http://localhost:5321");

export function listenToSocketEvents() {
    socket.on("connect", () => {    
        console.log("[SOCKET] Connected to backend");
    });
    
    socket.on("disconnect", () => {
        console.log("[SOCKET] Disconnected from backend");
    });

    socket.on("load_update", (data) => {
        const { requestType, status, message, timestamp } = data;
    
        if (!state.steps[requestType]) return;
    
        state.steps[requestType].status = status;
        state.steps[requestType].message = message;
        state.steps[requestType].timestamp = timestamp;
    
        if (data.history_entry) {
        state.steps[requestType].history.push(data.history_entry);
        }

        enableButtons(state.currentRequest);
    
        console.log(`[SOCKET] Load update from backend:`, requestType, data);
    });


    socket.on("step_update", (data) => {
        const { action, status, message, timestamp } = data;

        if (!state.steps[action]) return;

        state.steps[action].status = status;
        state.steps[action].message = message;
        state.steps[action].timestamp = timestamp;

        if (data.history_entry) {
        state.steps[action].history.push(data.history_entry);
        }

        console.log(`[SOCKET] Step updated from backend:`, action, data);
    });
}

