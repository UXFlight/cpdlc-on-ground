import { state } from '../state/state.js';
import { MSG_STATUS } from '../state/status.js';
// small utils functions
export function invalidRequest(action) {
  return (!action || checkNewRequest() || blockSecondRequest(action) || action === "pushback" && !state.steps[action].direction)
}

export function checkNewRequest() {
  return Object.values(state.steps).some(step => step.status === MSG_STATUS.NEW || step.status === MSG_STATUS.LOAD); // for now, blocking all other requests
}

function blockSecondRequest(action) {
  const currentStatus = state.steps[action]?.status;
  return currentStatus === MSG_STATUS.CLOSED || currentStatus === MSG_STATUS.NEW || currentStatus === MSG_STATUS.LOAD;
}

export function closeCurrentOverlay() {
    const open = document.querySelector(".overlay.open");
    if (open) open.classList.remove("open");
}

export function getLatestEntry(stepKey) {
  const group = state.history.find(h => h.stepKey === stepKey);
  return group?.entries[group.entries.length - 1] ?? null;
}
