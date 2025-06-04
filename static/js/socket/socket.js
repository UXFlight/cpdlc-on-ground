import { renderConnectionState } from "../socket-events/connectionEvents.js";
import { handleAtcResponse } from "../socket-events/atcResponse.js";
import { state } from "../state/state.js";
import { enableAllRequestButtons, disableAllRequestButtons } from "../ui/buttons-ui.js";
import { tickUpdate, timeoutEvent } from "../socket-events/timeoutEvent.js";

const socket = io("http://localhost:5321");

export function listenToSocketEvents() {
    // connection events
    socket.on("connect", () => {
        state.connection.backend = "connected";
        renderConnectionState(state.connection);
        enableAllRequestButtons();
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
        disableAllRequestButtons();
    });
    
    socket.on("disconnectedFromATC", () => {
        state.connection.atc.status = "disconnected";
        state.connection.atc.facility = null;
        renderConnectionState(state.connection);
    });

    // atc response events
    socket.on("atcResponse", (data) => handleAtcResponse(data));

    // time event
    socket.on("tick", (data) => tickUpdate(data))

    // timeout event
    socket.on("timeout", (data) => timeoutEvent(data))
}

