import { state, status } from '../state/state.js';
// small utils functions
export function checkPendingRequest() {
  return Object.values(state.steps).some(step => step.status === status.PENDING || step.status === status.LOAD); // for now, blocking all other requests
}

export function blockSecondRequest(action) {
  const currentStatus = state.steps[action]?.status;
  return currentStatus === status.CLOSED || currentStatus === status.PENDING || currentStatus === status.LOAD;
}

export function closeCurrentOverlay() {
    const open = document.querySelector(".dropdown.open");
    if (open) open.classList.remove("open");
}