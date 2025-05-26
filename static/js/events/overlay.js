import { state, status } from '../state/state.js';
import { checkPendingRequest, closeCurrentOverlay } from '../utils/utils.js';

// overlay event
export const toggleOverlay = (overlay, e) => {
  e.stopPropagation();

  document.querySelectorAll(".overlay.open").forEach(open => {
    open.classList.remove("open");
  });

  const action = overlay.dataset.action;
  if (state.steps[action].status === status.CLOSED) return;

  overlay.classList.add("open");
  if (action && !checkPendingRequest()) state.currentRequest = action;
};


export const closeOverlay = (event) => {
  if (event.target.closest(".overlay")) return;
  closeCurrentOverlay();
}