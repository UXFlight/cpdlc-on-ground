import { sendRequest } from './js/api.js';
import { createLog, showSpinner, showTick } from './js/ui.js';
import { state } from './js/state.js';

document.addEventListener("DOMContentLoaded", () => {
  listenToButtonEvents();
  listenToGlobalClickEvents();
});

function listenToButtonEvents() {
  const dropdownButtons = document.querySelectorAll(".dropdown-button");
  const requestButtons = document.querySelectorAll(".request-button");
  const cancelButtons = document.querySelectorAll(".cancel-button");

  const leftButton = document.getElementById("pushback-left");
  const rightButton = document.getElementById("pushback-right");

  // dropdown event
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

  // request btns event
  requestButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      const action = btn.dataset.action;
      
      if (action === "pushback" && !state.selectedPushbackDirection) return;
      
      const cancelBtn = document.querySelector(`.cancel-button[data-action="${action}"]`);

      showSpinner(action);

      try {
        if (cancelBtn) cancelBtn.disabled = false;
        const data = await sendRequest(action);

        if (!data.error) {
          createLog(data);
          showTick(action);
        } else {
          console.log("Error:", data.error);
          showTick(action, true)
        }

      } catch (err) {
        showTick(action, true)
        console.error("Network error:", err);
      }
    });
  });

  // cancel btns event
  cancelButtons.forEach(btn => {
    btn.addEventListener("click", async () => {     
      const action = btn.dataset.action;
      if (!action) return;
      if (btn.disabled) return;

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
      console.log(`${action} reset.`);
    });
  });

  // left/ right pushback event
  leftButton.addEventListener("click", () => selectPushbackDirection("left"));
  rightButton.addEventListener("click", () => selectPushbackDirection("right"));
}

function listenToGlobalClickEvents() {
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
  console.log(`Selected pushback direction: ${direction}`);
}