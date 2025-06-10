import { state } from '../state/state.js';
import { MSG_STATUS } from '../utils/consts/status.js';
import { checkNewRequest, closeCurrentOverlay } from '../utils/utils.js';

// overlay event
export const toggleOverlay = (overlay) => {
  document.querySelectorAll(".overlay.open").forEach(open => {
    open.classList.remove("open");
  });

  const action = overlay.dataset.requesttype;
  if (!action || state.steps[action].status === MSG_STATUS.CLOSED) return;

  overlay.classList.add("open");
};


export const handleGlobalClick = (event) => {
  const isInsideOverlay = event.target.closest(".overlay");
  const isInsideConnection = event.target.closest("#connection-status");
  if (!isInsideConnection) document.getElementById("connection-status")?.classList.remove("show-tooltip");
  if (!isInsideOverlay) closeCurrentOverlay();
};

// FOR MOBILE DEVICES
export const touchStartEvent = (e) => {
    const el = e.target.closest(".overlay");
    if (!el) return;
    el.classList.add("touched");
    setTimeout(() => { el.classList.remove("touched") }, 150);
}

export const touchFeedbackButtons = (e) => {
  const btn = e.target.closest('.request-button, .cancel-button');
  if (!btn || btn.disabled) return;

  btn.classList.add('touched');

  setTimeout(() => {
    btn.classList.remove('touched');
  }, 120);
};