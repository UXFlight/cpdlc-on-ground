import { sendRequest, postLoad } from './js/api.js';
import { createLog, showSpinner, showTick, enableButtons, disableExecuteButtons, enableWilcoButtons } from './js/ui.js';
import { state } from './js/state.js';

document.addEventListener("DOMContentLoaded", () => {
  listenToButtonEvents();
  listenToGlobalClickEvents();
});

// dropdown event
function listenToGlobalClickEvents() {
  const dropdownButtons = document.querySelectorAll(".dropdown-button");

  dropdownButtons.forEach(button => {
    const dropdownContent = button.nextElementSibling;

    button.addEventListener("click", (e) => {
      e.stopPropagation();

      document.querySelectorAll(".dropdown-content").forEach(content => {
        if (content !== dropdownContent) {
          content.style.display = "none";
        }
      });

      dropdownContent.style.display =
        dropdownContent.style.display === "block" ? "none" : "block";
    });
  });

  document.addEventListener("click", function (event) {
    document.querySelectorAll(".dropdown-content").forEach(dropdown => {
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
    btn.addEventListener("click", async (e) => cancelRequestEvent(btn.dataset.action, e.currentTarget));
  });

  // left/ right pushback event
  leftButton.addEventListener("click", () => selectPushbackDirection("left"));
  rightButton.addEventListener("click", () => selectPushbackDirection("right"));

  // load buttons event
  loadButton.addEventListener("click", async () => loadEvent());
  executeButton.addEventListener("click", async () => {});
  cancelExecuteButton.addEventListener("click", async () => {});

  // wilco buttons event
  wilcoButton.addEventListener("click", () => {});
  standbyButton.addEventListener("click", () => {});
  unableButton.addEventListener("click", () => {});
}

// pushback direction
const selectPushbackDirection = (direction) => {
  if (state.selectedPushbackDirection === direction) return;

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

  state.selectedPushbackDirection = direction;
  pushbackBtn.disabled = false;
  cancelPushbackBtn.disabled = false;
}

// request event
const sendRequestEvent = async (action) => {
  if (!action) return;
  
  if (action === "pushback" && !state.selectedPushbackDirection) return;
  
  const cancelBtn = document.querySelector(`.cancel-button[data-action="${action}"]`);

  showSpinner(action);
  disableExecuteButtons();

  try {
    if (cancelBtn) cancelBtn.disabled = false;
    const data = await sendRequest(action);

    if (!data.error) {
      state.messages[action] = data.message;
      state.currentRequest = action;
      console.log("state", state);
      createLog(data);
      showTick(action);
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
const cancelRequestEvent = async (action, btn) => {     
  if (!action || !btn || btn.disabled) return;

  const requestBtn = document.getElementById(`${action.replace(/_/g, "-")}-btn`);   
  
  if (action === "pushback") {
    leftButton.classList.remove("active");
    rightButton.classList.remove("active");
    state.selectedPushbackDirection = '';     
    requestBtn.disabled = true;
    btn.disabled = true;
    return;
  }

  if (requestBtn) {
    requestBtn.disabled = false;
    requestBtn.classList.remove('active');
  }

  const messageBox = document.getElementById(`${action.replace(/_/g, "-")}-message`);
  if (messageBox) messageBox.innerHTML = '';

  btn.disabled = true;
}

// load event
const loadEvent = async () => {
  if (!state.currentRequest || state.currentRequest === '') return;

  try {
    const data = await postLoad(state.currentRequest);

    if (data.error) {
      console.error("Load error:", data.error);
      return;
    }

    if (data.message === null) return;

    const clearanceBox = document.getElementById('taxi-clearance-message');
    clearanceBox.innerHTML = `<p>${data.message}</p>`;

    // preventMessageUpdate();
    enableWilcoButtons();

    console.log("Taxi clearance loaded:", data.message);

  } catch (err) {
    console.error("Network error:", err);
    alert("Error communicating with server.");
  }
}

// willco, standby, unable event
const actionEvent = async (action) => { 

}