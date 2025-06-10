
import { MSG_STATUS } from '../utils/consts/status.js';

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

// TAXI CLEARANCE
export function updateTaxiClearanceMsg(message = null, currentIndex = null) {
  const clearanceBox = document.getElementById('taxi-clearance-message');
  const clearanceMessageBox = document.querySelector(".taxi-clearance-box");

  if (!message) {
    clearanceBox.innerHTML = `<p id="clearance-placeholder">No clearance received</p>`;
    clearanceMessageBox.classList.remove("active");
    return;
  }

  const tokens = message.split(" ");
  const rendered = tokens.map((word, i) => {
    let cls = 'taxi-token';
    if (currentIndex !== null) {
      if (i < currentIndex) cls += ' done';
      else if (i === currentIndex) cls += ' next';
    }
    return `<span class="${cls}">${word}</span>`;
  }).join(" ");

  clearanceBox.innerHTML = `<div class="clearance-grid">${rendered}</div>`;
  clearanceMessageBox.classList.add("active");

  clearanceMessageBox.classList.remove("pulse");
  void clearanceMessageBox.offsetWidth; // trigger reflow
  clearanceMessageBox.classList.add("pulse");
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

// STATUS UPDATER //
export function updateMessageStatus(requestType, newStatus) {
  const message = document.querySelector(`.new-message[data-requesttype="${requestType}"]`);
  if (!message) return;

  const statusEl = message.querySelector('.status');
  if (!statusEl) return;

  Object.values(MSG_STATUS).forEach(status => statusEl.classList.remove(status.toLowerCase()));

  statusEl.textContent = newStatus.toUpperCase();
  statusEl.classList.add(newStatus.toLowerCase());
  message.dataset.status = newStatus.toLowerCase();
}

export function updateOverlayStatus(requestType, newStatus) {
  const overlay = document.querySelector(`.overlay[data-requesttype="${requestType}"]`);
  if (!overlay) return;

  Object.values(MSG_STATUS).forEach(status => {
      overlay.classList.remove(`status-${status.toLowerCase()}`);
      overlay.dataset.status = "";
  });

  const status = newStatus.toLowerCase();
  overlay.classList.add(`status-${status}`);
  overlay.dataset.status = status;

  const spinner = overlay.querySelector(`#${requestType}_spinner`);
  const tick = overlay.querySelector(`#${requestType}_tick`);

  if (!spinner || !tick) return;

  spinner.style.display = 'none';
  tick.style.display = 'none';

  if (status === 'requested' || status === 'load') {
      spinner.style.display = 'block';
  } else if (['wilco', 'executed', 'closed'].includes(status)) {
      tick.style.display = 'block';
  }
}

export function updateTaxiClearanceStatus(action, status) {
  const tcStatus = document.getElementById('taxi-clearance-status');
  if (!tcStatus) return;

  tcStatus.textContent = status.toUpperCase();
  tcStatus.classList.add('active');

  if (action === MSG_STATUS.EXECUTE) { tcStatus.classList.add('executed') }
}