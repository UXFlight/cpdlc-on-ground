import { sendRequest } from './js/api.js';
import { createLog, showTick } from './js/ui.js';
import { state } from './js/state.js';

document.addEventListener("DOMContentLoaded", () => {
  listenToButtonEvents();
  listenToGlobalClickEvents();
});

function listenToButtonEvents() {
  const dropdownButtons = document.querySelectorAll(".dropdown-button");
  const requestButtons = document.querySelectorAll(".request-button");
  const cancelButtons = document.querySelectorAll(".cancel-button");

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
      console.log(`Action : ${action}`);
      try {
        const data = await sendRequest(action);
        if (!data.error) {
          createLog(data);
          showTick(`${action}-tick-icon`);
        }
      } catch (err) {
        console.error("Network error:", err);
      }
    });
  }); 

  // cancel btns event
  cancelButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      const action = btn.dataset.action;
      if (!action) return;

      const messageBox = document.getElementById(`${action.replace(/_/g, "-")}-message`);
      const requestBtn = document.getElementById(`${action.replace(/_/g, "-")}-btn`);

      console.log(`Cancel button clicked: ${action}`);

      if (messageBox) messageBox.innerHTML = '';
      if (requestBtn) {
        requestBtn.disabled = true;
        requestBtn.classList.remove('active');
      }
      console.log(`${action} reset.`);

    });
  });
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
