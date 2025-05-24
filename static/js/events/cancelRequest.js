import { updateMessageStatus } from "../messages.js";
import { hideSpinner } from "../ui.js";
import { disableActionButtons } from "../buttons-ui.js";
import { state, status, updateDirection, updateStep } from '../state.js';

export async function cancelRequestEvent(action) {   
  if (!action || this.disabled) return;

  const requestBtn = document.getElementById(`${action.replace(/_/g, "-")}-btn`);

  updateStep(status.CANCELLED, status.CANCELLED) //! when will be sending request, updateStep with response.json().message
  updateMessageStatus(action, state.steps[action].status);
  
  if (action === "pushback") {
    document.getElementById("pushback-left").classList.remove("active");
    document.getElementById("pushback-right").classList.remove("active");
    updateDirection(null);
    
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