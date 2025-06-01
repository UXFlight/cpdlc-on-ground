import { updateMessageStatus } from "../messages/historyLogs.js";
import { hideSpinner } from "../ui/ui.js";
import { enableAllRequestButtons } from "../ui/buttons-ui.js";
import { state, updateDirection, updateStep } from '../state/state.js';
import { MSG_STATUS } from "../state/status.js";
import { appendToLog, createHistoryLog } from "../messages/historyLogs.js";
import { filterHistoryLogs } from "./filter.js";

export async function cancelRequestEvent(action) {
  if (!action || this.disabled) return;

  const requestBtn = document.getElementById(`${action.replace(/_/g, "-")}-btn`);

  updateStep(MSG_STATUS.CANCELLED, MSG_STATUS.CANCELLED) //! when will be sending request, updateStep with response.json().message
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
  /*
      const messageBox = document.getElementById(`${action.replace(/_/g, "-")}-message`);
      if (messageBox) messageBox.innerHTML = '';
   * 
   * 
  */

  filterHistoryLogs();

  this.disabled = true;
  hideSpinner(action);
  enableAllRequestButtons();
}