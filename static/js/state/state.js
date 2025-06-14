import { updateMessageStatus, updateOverlayStatus } from "../ui/ui.js";
import { markDashboardReady } from "./settingsState.js";

// Global state
export const state = {
  isFiltered: false,           // used to filter history logs
  history: [],                // history logs
  connection: {
    connectedSince: null, // timestamp when the connection was established
    backend: "connecting",    // "connecting" | "connected" | "disconnected"
    atc: {
      status : "pending",     // "pending" | "connected" | "disconnected"
      facility: null, 
    },
  },
  steps: {
    expected_taxi_clearance: createStep("Expected Taxi Clearance"),
    engine_startup: createStep("Engine Startup"),
    pushback: createStep("Pushback", { direction: null }),
    taxi_clearance: createStep("Taxi Clearance"),
    startup_cancellation: createStep("Startup Cancellation"),
    de_icing: createStep("De-Icing"),
    request_voice_contact: createStep("Request Voice Contact"), 
  },
};

function createStep(label, extra = {}) {
  return {
    label,
    status: null,
    message: null,
    timestamp: null,
    timeLeft : null,
    ...extra
  };
}

export function updateStep(requestType, newStatus, newMessage = null, timestamp = null, timeLeft = null) {
  const key = requestType;
  const step = state.steps[key];
  if (!step) return;

  const entry = {
    status: newStatus,
    message: newMessage,
    timestamp: timestamp || new Date().toISOString().replace('T', ' ').split('.')[0]
  };

  step.status = newStatus;
  step.message = newMessage;
  step.timestamp = entry.timestamp;

  if (timeLeft !== null) {
    step.timeLeft = timeLeft;
  }

  let group = state.history.find(h => h.stepKey === key);
  if (!group) {
    group = { stepKey: key, label: step.label, entries: [] };
    state.history.push(group);
  }
  group.entries.push(entry);

  updateMessageStatus(key, newStatus);
  updateOverlayStatus(key, newStatus);
  markDashboardReady();
}

export function updateDirection(direction = null) {
  state.steps["pushback"].direction = direction;
  document.getElementById("pushback-left").classList.toggle("active", direction === "left");
  document.getElementById("pushback-right").classList.toggle("active", direction === "right");
}