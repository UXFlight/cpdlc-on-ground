import { status } from './state.js'
// all events imported
import { selectPushbackDirection } from './events/pushbackDirection.js';
import { sendRequestEvent } from './events/sendRequest.js';
import { toggleOverlay, closeOverlay } from './events/overlay.js';
import { cancelRequestEvent } from './events/cancelRequest.js';
import { loadEvent } from './events/load.js';
import { executeEvent, cancelExecuteEvent } from './events/execute.js';
import { actionEvent } from './events/action.js';

document.addEventListener("DOMContentLoaded", () => {
  listenToButtonEvents();
  listenToGlobalClickEvents();
});

function listenToGlobalClickEvents() {
  const dropdowns = document.querySelectorAll(".dropdown");

  dropdowns.forEach(dropdown => {
    const button = dropdown.querySelector(".dropdown-button");
    button.addEventListener("click", (e) => toggleOverlay(dropdown, e));
  });

  document.addEventListener("click", (event) => closeOverlay(event));
}

function listenToButtonEvents() {
  const requestButtons = document.querySelectorAll(".request-button");
  const cancelButtons = document.querySelectorAll(".cancel-button");

  const leftButton = document.getElementById("pushback-left");
  const rightButton = document.getElementById("pushback-right");

  const loadButton = document.getElementById("load-button");
  const executeButton = document.getElementById("execute-button");
  const cancelExecuteButton = document.getElementById("cancel-execute-button");
  
  const wilcoButton = document.getElementById("wilco");
  const standbyButton = document.getElementById("standby");
  const unableButton = document.getElementById("unable");

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
  loadButton.addEventListener("click", loadEvent.bind(loadButton)); // bind to set 'this' to load btn
  executeButton.addEventListener("click", async () => executeEvent());
  cancelExecuteButton.addEventListener("click", async () => cancelExecuteEvent());

  // wilco buttons event
  wilcoButton.addEventListener("click", () => actionEvent(status.WILCO));
  standbyButton.addEventListener("click", () => actionEvent(status.STANDBY));
  unableButton.addEventListener("click", () => actionEvent(status.UNABLE));
}
