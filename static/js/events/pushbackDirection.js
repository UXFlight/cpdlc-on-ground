import { state, updateDirection } from '../state/state.js';
import { MSG_STATUS } from '../utils/consts/status.js';
import { isConnected } from '../utils/utils.js';

// pushback direction
export const selectPushbackDirection = (e) => {
  const direction = e.target.textContent;
  const prevDirection = state.steps["pushback"].direction;
  const pushbackStatus = state.steps["pushback"].status;
  const isActive = [MSG_STATUS.NEW , MSG_STATUS.LOADED, MSG_STATUS.EXECUTED, MSG_STATUS.CLOSED].includes(pushbackStatus);
  if (isActive) document.getElementById(`pushback-${direction}`).disabled = true;
  if (!direction || direction === prevDirection || isActive) return;

  const pushbackBtn = document.getElementById("pushback-btn");
  const cancelPushbackBtn = document.querySelector(".cancel-button[data-requesttype='pushback']");

  updateDirection(direction);

  ["pushback-left", "pushback-right"].forEach(id => document.getElementById(id).disabled = true);

  if (pushbackBtn && isConnected()) pushbackBtn.disabled = false;
  if (cancelPushbackBtn) cancelPushbackBtn.disabled = false;
};

export const enablePushbackRequest = () => {
  const right = document.getElementById('pushback-right');
  const left = document.getElementById('pushback-left');
  
  if (right.classList.contains('active') || left.classList.contains('active')) {
    const pushbackBtn = document.getElementById("pushback-btn");
    if (pushbackBtn) pushbackBtn.disabled = false;
  }
}