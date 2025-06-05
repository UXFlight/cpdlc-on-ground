// all events imported
import { sendRequestEvent } from './events/sendRequest.js';
import { cancelRequestEvent } from './events/cancelRequest.js';
import { toggleOverlay, closeOverlay } from './events/overlay.js';
import { selectPushbackDirection } from './events/pushbackDirection.js';
import { setupSocketListeners } from './socket/socket-listens.js';
import { filterHistoryLogs } from './events/filter.js';
import { state } from './state/state.js';
import { initState } from './state/init.js';

document.addEventListener("DOMContentLoaded", () => {
  // initState(); // Initialize the state object
  setupSocketListeners() // ok
  listenToButtonEvents(); // ok
  listenToGlobalClickEvents(); // ok
});

function listenToGlobalClickEvents() {
  const overlays = document.querySelectorAll(".overlay");

  overlays.forEach(overlay => {
    const button = overlay.querySelector(".overlay-button");
    button.addEventListener("click", (e) => { toggleOverlay(overlay, e); });
  });

  document.addEventListener("click", (event) => closeOverlay(event));
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
  leftButton.addEventListener("click", () => selectPushbackDirection("left"));
  rightButton.addEventListener("click", () => selectPushbackDirection("right"));

  // filter btn event
  filterButton.addEventListener("click", () => {
    state.isFiltered = !state.isFiltered;
    filterHistoryLogs()
  });
}
