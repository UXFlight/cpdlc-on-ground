import { state } from "../state/state.js";
// ui/connection-ui.js
const indicator = document.getElementById("connection-indicator");
const text = document.getElementById("connection-text");
const backendStatus = document.getElementById("backend-status");
const atcStatus = document.getElementById("atc-status");
const backendIcon = document.getElementById("backend-icon");
const atcIcon = document.getElementById("atc-icon");


export function renderConnectionState(connection) {
    updateMainIndicator(connection);
    updateTooltip(connection);
  }
  
function updateMainIndicator(connection) {

    indicator.className = "status-indicator";
    const { backend, atc } = connection;

    if (backend === "connected" && atc.status === "connected") {
    indicator.classList.add("connected");
    text.textContent = `Connected to ${atc.facility}`;
    } else if (backend === "connected" && atc.status !== "connected") {
    indicator.classList.add("partial");
    text.textContent = "Establishing connection to ATC...";
    } else if (backend === "disconnected") {
    indicator.classList.add("disconnected");
    text.textContent = "Disconnected from server";
    } else {
    indicator.classList.add("connecting");
    text.textContent = "Connecting to server...";
    }
}

function updateTooltip(connection) {
    const backendText = document.getElementById("backend-text");
    const backendIcon = document.getElementById("backend-icon");
    const atcText = document.getElementById("atc-text");
    const atcIcon = document.getElementById("atc-icon");

    if (!backendText || !backendIcon || !atcText || !atcIcon) return;

    backendText.textContent =
    connection.backend === "connected"
        ? "Connected"
        : connection.backend === "disconnected"
        ? "Disconnected"
        : "Connecting...";

    atcText.textContent =
    connection.atc.status === "connected"
        ? `Connected to ${connection.atc.facility}`
        : connection.atc.status === "disconnected"
        ? "Disconnected"
        : "Waiting...";

    backendIcon.className = "status-dot " + (
    connection.backend === "connected"
        ? "success"
        : connection.backend === "disconnected"
        ? "failure"
        : "pending"
    );

    atcIcon.className = "status-dot " + (
    connection.atc.status === "connected"
        ? "success"
        : connection.atc.status === "disconnected"
        ? "failure"
        : "pending"
    );
}
