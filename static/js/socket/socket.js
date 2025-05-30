import { enableButtons } from "../ui/buttons-ui.js";
import { renderConnectionState } from "../socket-events/connectionEvents.js";
import { handleAtcResponse } from "../socket-events/atcResponse.js";
import { state } from "../state/state.js";

const socket = io("http://localhost:5321");

export function listenToSocketEvents() {
    // connection events
    socket.on("connect", () => {
        state.connection.backend = "connected";
        renderConnectionState(state.connection);
    });
      
    socket.on("connectedToATC", (data) => {
        state.connection.atc.status = "connected";
        state.connection.atc.facility = data.facility;
        renderConnectionState(state.connection);
    });
    
    // disconnection events
    socket.on("disconnect", () => {
        state.connection.backend = "disconnected";
        state.connection.atc.status = "disconnected"; // if backend down, cannot communicate w ATC
        state.connection.atc.facility = null;
        renderConnectionState(state.connection);
    });
    
    socket.on("disconnectedFromATC", () => {
        state.connection.atc.status = "disconnected";
        state.connection.atc.facility = null;
        renderConnectionState(state.connection);
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
    });


    socket.on("step_update", (data) => {
        const { action, status, message, timestamp } = data;

        if (!state.steps[action]) return;

        state.steps[action].status = status;
        state.steps[action].message = message;
        state.steps[action].timestamp = timestamp;

        if (data.history_entry) {
            state.history.push(data.history_entry);
        }
    });

    socket.on("atcResponse", (data) => handleAtcResponse(data));
}

