import { state } from '../state/state.js';
import { MSG_STATUS } from '../state/status.js';
import { checkNewRequest, closeCurrentOverlay } from '../utils/utils.js';

// overlay event
export const toggleOverlay = (overlay, e) => {
  e.stopPropagation();

  document.querySelectorAll(".overlay.open").forEach(open => {
    open.classList.remove("open");
  });

  const action = overlay.dataset.requesttype;
  if (!action || state.steps[action].status === MSG_STATUS.CLOSED) return;

  overlay.classList.add("open");
};


export const closeOverlay = (event) => {
  if (event.target.closest(".overlay")) return;
  closeCurrentOverlay();
}