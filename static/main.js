import { sendRequest, postLoad, postExecute, postAction } from './js/api.js';
import { createLog, showSpinner, showTick, enableButtons, enableActionButtons, disableActionButtons, hideSpinner } from './js/ui.js';
import { state } from './js/state.js';

document.addEventListener("DOMContentLoaded", () => {
  listenToButtonEvents();
  listenToGlobalClickEvents();
});

// dropdown event
function listenToGlobalClickEvents() {
  const dropdownButtons = document.querySelectorAll(".dropdown-button");
  const dropdownContents = document.querySelectorAll(".dropdown-content");

  dropdownButtons.forEach(button => {
    const dropdownContent = button.nextElementSibling;

    button.addEventListener("click", (e) => {
      e.stopPropagation();

      const dropdownAction = dropdownContent.querySelector('.request-button')?.dataset.action;
      if (dropdownAction) state.currentRequest = dropdownAction

      dropdownContents.forEach(content => {
        if (content !== dropdownContent) {
          content.style.display = "none";
        }
      });

      dropdownContent.style.display =
        dropdownContent.style.display === "block" ? "none" : "block";
    });
  });

  document.addEventListener("click", function (event) {
    dropdownContents.forEach(dropdown => {
      const parent = dropdown.parentElement;
      const button = parent.querySelector(".dropdown-button");

      const isClickInsideDropdown = dropdown.contains(event.target);
      const isClickOnButton = button && button.contains(event.target);

      if (!isClickInsideDropdown && !isClickOnButton) dropdown.style.display = "none";
    });
  });
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
    btn.addEventListener("click", async () => sendRequestEvent(btn.dataset.action));
  });

  // cancel btns event
  cancelButtons.forEach(btn => {
    btn.addEventListener("click", cancelRequestEvent.bind(btn, btn.dataset.action)); // bind to set 'this' to cancel btn
  });  

  // left/ right pushback event
  leftButton.addEventListener("click", () => selectPushbackDirection("left"));
  rightButton.addEventListener("click", () => selectPushbackDirection("right"));

  // load buttons event
  loadButton.addEventListener("click", loadEvent.bind(loadButton)); // bind to set 'this' to load btn
  executeButton.addEventListener("click", async () => executeEvent(state.currentRequest));
  cancelExecuteButton.addEventListener("click", async () => {});

  // wilco buttons event
  wilcoButton.addEventListener("click", () => actionEvent('wilco'));
  standbyButton.addEventListener("click", () => actionEvent('standby'));
  unableButton.addEventListener("click", () => actionEvent('unable'));
}

// pushback direction
const selectPushbackDirection = (direction) => {
  if (state.steps[state.currentRequest].direction === direction) return;

  const pushbackBtn = document.getElementById("pushback-btn");
  const cancelPushbackBtn = document.getElementById("cancel-pushback-btn");

  const leftButton = document.getElementById("pushback-left");
  const rightButton = document.getElementById("pushback-right");

  if (direction === "left") {
    leftButton.classList.add("active");
    rightButton.classList.remove("active");
  } else {
    rightButton.classList.add("active");
    leftButton.classList.remove("active");
  }

  state.steps[state.currentRequest].direction = direction;
  pushbackBtn.disabled = false;
  cancelPushbackBtn.disabled = false;
}

// request event
const sendRequestEvent = async (action) => {
  if (!action) return;
  
  if (action === "pushback" && !state.steps[action].direction) return;
  
  const cancelBtn = document.querySelector(`.cancel-button[data-action="${action}"]`);

  showSpinner(action);
  disableActionButtons('load');
  disableActionButtons('wilco');

  try {
    if (cancelBtn) cancelBtn.disabled = false;
    const data = await sendRequest(action);

    if (!data.error) {
      state.steps[action].message = data.message;
      createLog(data);
      // showTick(action);
      enableButtons(action);
    } else {
      showTick(action, true)
    }

  } catch (err) {
    showTick(action, true)
    console.error("Network error:", err);
  }
}

// cancel event
async function cancelRequestEvent(action) {     
  if (!action || this.disabled) return;

  const requestBtn = document.getElementById(`${action.replace(/_/g, "-")}-btn`);

  console.log(state);
  
  if (action === "pushback") {
    document.getElementById("pushback-left").classList.remove("active");
    document.getElementById("pushback-right").classList.remove("active");
    state.steps[action].direction = null;     
    requestBtn.disabled = true;
    this.disabled = true;
    return;
  }

  if (requestBtn) {
    requestBtn.disabled = false;
    requestBtn.classList.remove('active');
  }

  const messageBox = document.getElementById(`${action.replace(/_/g, "-")}-message`);
  if (messageBox) messageBox.innerHTML = '';

  this.disabled = true;
  hideSpinner(action);
}

// load event
async function loadEvent() {
  if (!state.currentRequest) return;

  try {
    const data = await postLoad(state.currentRequest);

    if (data.error) {
      console.error("Load error:", data.error);
      return;
    }

    if (data.message === null) return;

    const clearanceBox = document.getElementById('taxi-clearance-message');
    clearanceBox.innerHTML = `<p>${data.message}</p>`;

    if(state.currentRequest === 'taxi_clearance') enableActionButtons('load');
    else enableActionButtons('wilco');

    this.disabled = true;

  } catch (err) {
    console.error("Network error:", err);
    alert("Error communicating with server.");
  }
}

// execute event
const executeEvent = async (action) => {
  if (!action) return;

  const data = await postExecute(action);

  if (data.error) {
    console.error("Execute error:", data.error);
    return;
  }

  if (data.message === null) return;

  const clearanceBox = document.getElementById('taxi-clearance-message');
  clearanceBox.innerHTML = `<p>${data.message}</p>`;

  disableActionButtons('load');
  enableActionButtons('wilco');
}

const cancelExecuteEvent = async (action) => { // for now only disabling buttons

  disableActionButtons('load');
  enableActionButtons('wilco');
}

// willco, standby, unable event
const actionEvent = async (action) => { 
  if (!action) return;

  showSpinner(action);
  disableActionButtons('load');
  disableActionButtons('wilco');

  try {
    const data = await postAction(action);
    if (!data.error) {
      state.steps[state.currentRequest].status = action;
      createLog(data);
      showTick(state.currentRequest);
      console.log(state.currentRequest);
    } else {
      console.warn(`Server error on '${action}'`, data.error);
      showTick(action, true);
    }
  } catch (err) {
    console.error(`Error handling action '${action}'`, err);
    showTick(action, true);
  }
}
