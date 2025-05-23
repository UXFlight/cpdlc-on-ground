import { state, status } from '../state.js';
import { checkPendingRequest, closeCurrentOverlay } from '../utils.js';

// overlay event
export const toggleOverlay = (overlay, e) => {
  e.stopPropagation();

  const isOpen = overlay.classList.contains("open");

  document.querySelectorAll(".overlay.open").forEach(open => {
    open.classList.remove("open");
  });

  if (!isOpen) {
    const action = overlay.dataset.action;
    if (state.steps[action].status === status.CLOSED) return;
    overlay.classList.add("open");

    if (action && !checkPendingRequest()) state.currentRequest = action;
  }
}

export const closeOverlay = (event) => {
  if (event.target.closest(".dropdown")) return;
  closeCurrentOverlay();
}