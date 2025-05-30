import { MSG_STATUS } from './state/status.js';
// all events imported
import { loadEvent } from './events/load.js';
import { actionEvent } from './events/action.js';
import { sendRequestEvent } from './events/sendRequest.js';
import { cancelRequestEvent } from './events/cancelRequest.js';
import { toggleOverlay, closeOverlay } from './events/overlay.js';
import { executeEvent, cancelExecuteEvent } from './events/execute.js';
import { selectPushbackDirection } from './events/pushbackDirection.js';
import { enableAllRequestButtons } from './ui/buttons-ui.js';
import { listenToSocketEvents } from './socket/socket.js';
import { filterHistoryLogs } from './events/filter.js';

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

  // const loadButton = document.getElementById("load-button");
  // const executeButton = document.getElementById("execute-button");
  // const cancelExecuteButton = document.getElementById("cancel-execute-button");
  
  // const wilcoButton = document.getElementById("wilco");
  // const standbyButton = document.getElementById("standby");
  // const unableButton = document.getElementById("unable");

  const wilcoButtonsGrp = document.querySelectorAll('.wilco-grp');

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

  // load buttons event
  // loadButton.addEventListener("click", function (e) {loadEvent.call(this, e)});
  // executeButton.addEventListener("click", async (e) => executeEvent(e));
  // cancelExecuteButton.addEventListener("click", async (e) => cancelExecuteEvent(e));

  // wilco buttons event
  // wilcoButton.addEventListener("click", (e) => actionEvent(MSG_STATUS.WILCO, e));
  // standbyButton.addEventListener("click", (e) => actionEvent(MSG_STATUS.STANDBY, e));
  // unableButton.addEventListener("click", (e) => actionEvent(MSG_STATUS.UNABLE, e));

  wilcoButtonsGrp.forEach((btn) => 
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      enableAllRequestButtons();
    })
  );

  filterButton.addEventListener("click", () => filterHistoryLogs());
}
