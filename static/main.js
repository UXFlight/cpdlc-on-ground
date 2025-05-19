import { sendRequest, postLoad, postExecute, postAction } from './js/api.js';
import { state, status } from './js/state.js';
import { createLog, showSpinner, showTick, enableButtons, enableActionButtons, disableActionButtons, hideSpinner, updateMessageStatus, disableRequestButtons } from './js/ui.js';

document.addEventListener("DOMContentLoaded", () => {
  listenToButtonEvents();
  listenToGlobalClickEvents();
});

function listenToGlobalClickEvents() {
  const dropdowns = document.querySelectorAll(".dropdown");

  dropdowns.forEach(dropdown => {
    const button = dropdown.querySelector(".dropdown-button");
    button.addEventListener("click", (e) => toggleDropdown(dropdown, e));
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest(".dropdown")) return;
    closeCurrentOverlay();
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
  executeButton.addEventListener("click", async () => executeEvent(state.currentRequest));
  cancelExecuteButton.addEventListener("click", async () => cancelExecuteEvent(state.currentRequest));

  // wilco buttons event
  wilcoButton.addEventListener("click", () => actionEvent(status.WILCO));
  standbyButton.addEventListener("click", () => actionEvent(status.STANDBY));
  unableButton.addEventListener("click", () => actionEvent(status.UNABLE));
}

// overlay event
const toggleDropdown = (dropdown, e) => {
  e.stopPropagation();

  const isOpen = dropdown.classList.contains("open");

  document.querySelectorAll(".dropdown.open").forEach(open => {
    open.classList.remove("open");
  });

  if (!isOpen) {
    const action = dropdown.dataset.action;
    if (state.steps[action].status === status.CLOSED) return;
    dropdown.classList.add("open");

    if (action && !checkPendingRequest()) state.currentRequest = action;
  }
}

// close overlay
function closeCurrentOverlay() {
  const open = document.querySelector(".dropdown.open");
  if (open) open.classList.remove("open");
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
  if (checkPendingRequest()) return;
  if (blockSecondRequest(action)) return;  
  if (action === "pushback" && !state.steps[action].direction) return;
  
  state.steps[action].status = status.PENDING; // change status to pending asap
  const cancelBtn = document.querySelector(`.cancel-button[data-action="${action}"]`);

  showSpinner(action);
  disableActionButtons(status.LOAD);
  disableActionButtons(status.WILCO);

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
      closeCurrentOverlay();
      state.steps[action].status = status.ERROR;
    }

  } catch (err) {
    showTick(action, true)
    closeCurrentOverlay();
    state.steps[action].status = status.ERROR;
    console.error("Network error:", err);
  }
}

function checkPendingRequest() {
  return Object.values(state.steps).some(step => step.status === status.PENDING); // for now, blocking all other requests
}

function blockSecondRequest(action) {
  const currentStatus = state.steps[action]?.status;
  return currentStatus === status.CLOSED || currentStatus === status.PENDING || currentStatus === status.LOAD;
}

// cancel event
async function cancelRequestEvent(action) {   
  if (!action || this.disabled) return;

  const requestBtn = document.getElementById(`${action.replace(/_/g, "-")}-btn`);

  state.steps[action].status = status.CANCELLED;
  updateMessageStatus(action, state.steps[action].status);
  
  if (action === "pushback") {
    document.getElementById("pushback-left").classList.remove("active");
    document.getElementById("pushback-right").classList.remove("active");
    state.steps[action].direction = null;     
  }

  if (requestBtn) {
    requestBtn.disabled = false;
    requestBtn.classList.remove('active');
  }

  // putting cancelled status
  const messageBox = document.getElementById(`${action.replace(/_/g, "-")}-message`);
  if (messageBox) messageBox.innerHTML = '';

  this.disabled = true;
  hideSpinner(action);
  disableActionButtons(status.LOAD);
  disableActionButtons(status.WILCO);
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

    // create taxi clearance message
    const clearanceBox = document.getElementById('taxi-clearance-message');
    clearanceBox.innerHTML = `<p>${data.message}</p>`;

    if(state.currentRequest === 'taxi_clearance') enableActionButtons(status.LOAD);
    else enableActionButtons(status.WILCO);

    this.disabled = true;
    // state.steps[state.currentRequest].status = status.LOAD; // temp ?

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

  disableActionButtons(status.LOAD);
  enableActionButtons(status.WILCO);
}

const cancelExecuteEvent = async (action) => { // for now only enabling load button
  disableActionButtons(status.LOAD);
  enableButtons(action);
}

// willco, standby, unable event
const actionEvent = async (action) => {
  if (!action) return;

  showSpinner(action);
  disableActionButtons(status.LOAD);
  disableActionButtons(status.WILCO);

  try {
    const currentRequest = state.steps[state.currentRequest];
    const data = await postAction(action);
    if (!data.error) {
      currentRequest.status = action === status.WILCO ? status.CLOSED : action;
      currentRequest.message = data.message; // recheck this // saving server response but for what ?
      createLog(data);
      updateMessageStatus(state.currentRequest, currentRequest.status);
      if (action === status.WILCO) {
        disableRequestButtons(state.currentRequest);
        showTick(state.currentRequest);
      } else {
        showTick(state.currentRequest, true)
      }
    } else {
      console.warn(`Server error on '${action}'`, data.error);
      showTick(action, true);
    }
  } catch (err) {
    console.error(`Error handling action '${action}'`, err);
    showTick(action, true);
  }
}
