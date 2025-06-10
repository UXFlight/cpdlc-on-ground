// all events imported
import { sendRequestEvent } from './events/sendRequest.js';
import { cancelRequestEvent } from './events/cancelRequest.js';
import { toggleOverlay, touchStartEvent, handleGlobalClick, touchFeedbackButtons } from './events/overlay.js';
import { selectPushbackDirection } from './events/pushbackDirection.js';
import { setupSocketListeners } from './socket/socket-listens.js';
import { filterEvent } from './events/filter.js';
import { state } from './state/state.js';
import { initState } from './state/init.js';

document.addEventListener("DOMContentLoaded", () => {
  // initState(); // Initialize the state object
  setupSocketListeners() // ok
  listenToButtonEvents(); // ok
  listenToGlobalClickEvents(); // ok
  listenToHeaderEvents();
});

function listenToGlobalClickEvents() {
  const overlays = document.querySelectorAll(".overlay");

  overlays.forEach(overlay => {
    overlay.addEventListener("click", () => toggleOverlay(overlay));
  });

  document.addEventListener("click", handleGlobalClick);
  document.addEventListener("touchstart", (e) => {
    touchStartEvent(e);         // overlays
    touchFeedbackButtons(e);    // req/cancel btns
  });
  }

function listenToButtonEvents() {
  const requestButtons = document.querySelectorAll(".request-button");
  const cancelButtons = document.querySelectorAll(".cancel-button");

  const leftButton = document.getElementById("pushback-left");
  const rightButton = document.getElementById("pushback-right");

  const filterButton = document.getElementById("filter-btn");

  // request buttons
  requestButtons.forEach(btn => {
    btn.addEventListener("click", function (e) {
      sendRequestEvent.call(this, e);
    });
  });

  // cancel buttons
  cancelButtons.forEach(btn => {
    btn.addEventListener("click", function (e) {
      cancelRequestEvent.call(this, e);
    });
  });

  // left/ right pushback event
  leftButton.addEventListener("click", (e) => selectPushbackDirection(e));
  rightButton.addEventListener("click", (e) => selectPushbackDirection(e));

  // filter btn event
  filterButton.addEventListener("click", () => filterEvent());
}

export function listenToHeaderEvents() {
  const connectionStatus = document.getElementById('connection-status');
  connectionStatus.addEventListener('click', () => connectionStatus.classList.toggle('show-tooltip'));
}
