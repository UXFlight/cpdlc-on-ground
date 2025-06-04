
import { MSG_STATUS } from "../state/status.js";

// loader
export function showSpinner(requestType) {
  const spinner = document.getElementById(`${requestType}_spinner`);
  if (spinner) spinner.style.display = "inline-block";

  hideTick(requestType);
}

export function showTick(requestType, isError = false) {
  const tick = document.getElementById(`${requestType}_tick`);
  const wrapper = document.querySelector(`.overlay[data-requestType="${requestType}"]`);

  hideSpinner(requestType);

  if (wrapper) wrapper.setAttribute('data-status', isError ? 'error' : 'fulfilled');
  if (!tick) return;

  tick.style.display = "inline-block";
  tick.textContent = isError ? "✖" : "✔";
  tick.classList.toggle('error', isError);
  tick.classList.toggle('success', !isError);
}

export function hideSpinner(requestType) {
  const spinner = document.getElementById(`${requestType}_spinner`);
  if (spinner) spinner.style.display = "none";
}

export function hideTick(requestType) {
  const tick = document.getElementById(`${requestType}_tick`);
  if (tick) {
    tick.style.display = 'none';
    tick.classList.remove('error');
  }
}

export function changeFilterIcon() {
  const svg = document.getElementById("filter-icon");
  if(svg) svg.classList.toggle("filtered");
}

export function ensureMessageBoxNotEmpty(divId='history-log-box') {
  const historyLogBox = document.getElementById(divId);
  const noMessages = document.getElementById('empty-history-message');
  if (historyLogBox.classList.contains('empty')) {
      historyLogBox.classList.remove('empty');
      noMessages?.classList.add('hidden');
  }
}

export function clearMessageBox(boxId='history-log-box') {
  ensureMessageBoxNotEmpty();
  const box = document.getElementById(boxId);
  if (box) box.innerHTML = '';
}


export function playNotificationSound() {
    const audio = new Audio('/static/mp3/notif.mp3');
    audio.volume = 0.3;
    audio.play().catch(err => console.warn('Unable to play sound:', err));
}

export function flashElement(div) {
    div.classList.add('flash');
    setTimeout(() => div.classList.remove('flash'), 1000);
}

export function updateTaxiClearanceMsg(message = null) {
  const clearanceBox = document.getElementById('taxi-clearance-message');
  const clearanceMessageBox = document.querySelector(".taxi-clearance-box");
  clearanceBox.innerHTML = `<p>${message}</p>`;
  message ? clearanceMessageBox.classList.add("active") : clearanceMessageBox.classList.remove("active");
}

// display snackbar messages
export function updateSnackbar(requestType, status, customMessage = null, isError = true) {
  let message;

  switch (status) {
    case MSG_STATUS.CANCELLED:
      message = `${formatLabel(requestType)} request cancelled.`;
      break;
    case MSG_STATUS.ERROR:
      message = customMessage || `An error occurred on ${formatLabel(requestType)}.`;
      break;
    case "success":
      message = customMessage || "Operation successful.";
      isError = false;
      break;
    default:
      message = customMessage || formatLabel(status);
  }

  showSnackbar(message, isError);
}

export function showSnackbar(message, isError = true) {
  const container = document.getElementById("snackbar-container");
  if (!container) return;

  container.innerHTML = '';
  const snackbar = document.createElement("div");
  snackbar.className = `snackbar ${isError ? "snackbar-error" : "snackbar-success"}`;
  snackbar.textContent = message;

  container.appendChild(snackbar);

  setTimeout(() => {
    snackbar.classList.add("fade-out");
  }, 1500);

  setTimeout(() => {
    snackbar.remove();
  }, 2000);
}

function formatLabel(text) {
  return text
    .replace(/_/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

export function formatRequestType(requestType) {
  if (!requestType) return null;
  return requestType
    .toLowerCase()
    .replace(/\s+/g, "_");
}

