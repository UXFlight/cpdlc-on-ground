// all events imported
import { sendRequestEvent } from './events/sendRequest.js';
import { cancelRequestEvent } from './events/cancelRequest.js';
import { toggleOverlay, closeOverlay } from './events/overlay.js';
import { selectPushbackDirection } from './events/pushbackDirection.js';
import { enableAllRequestButtons } from './ui/buttons-ui.js';
import { listenToSocketEvents } from './socket/socket.js';
import { filterHistoryLogs } from './events/filter.js';
import { state } from './state/state.js';

document.addEventListener("DOMContentLoaded", () => {
  listenToSocketEvents() // ok
  listenToButtonEvents();
  listenToGlobalClickEvents(); // ok
});

function listenToGlobalClickEvents() {
  const overlays = document.querySelectorAll(".overlay");

  overlays.forEach(overlay => {
    const button = overlay.querySelector(".overlay-button");
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleOverlay(overlay, e)
    });
  });

  document.addEventListener("click", (event) => closeOverlay(event));
}

function listenToButtonEvents() {
  const requestButtons = document.querySelectorAll(".request-button");
  const cancelButtons = document.querySelectorAll(".cancel-button");

  const leftButton = document.getElementById("pushback-left");
  const rightButton = document.getElementById("pushback-right");

  const filterButton = document.getElementById("filter-btn");

  const wilcoButtonsGrp = document.querySelectorAll('.wilco-grp'); //! revoir

  // request btns event
  requestButtons.forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await sendRequestEvent(btn.dataset.action);
    });
  });

  // ancel buttons
  cancelButtons.forEach(btn => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      cancelRequestEvent.call(this, btn.dataset.action);
    });
  });

  // left/ right pushback event
  leftButton.addEventListener("click", () => selectPushbackDirection("left"));
  rightButton.addEventListener("click", () => selectPushbackDirection("right"));

  wilcoButtonsGrp.forEach((btn) => 
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      enableAllRequestButtons();
    })
  );

  filterButton.addEventListener("click", () => {
    state.isFiltered = !state.isFiltered;
    filterHistoryLogs()
  });
}
