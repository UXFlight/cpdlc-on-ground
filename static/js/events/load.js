import { state, updateStep } from '../state/state.js';
import { MSG_STATUS } from "../state/status.js";
import { postLoad } from "../api/api.js";
import { updateMessageStatus } from '../messages/historyLogs.js';

export async function loadEvent(e, action) {
  const executeButton = document.getElementById(`execute-button-${action}`);
  const cancelExecuteButton = document.getElementById(`cancel-execute-button-${action}`);

  e.stopPropagation();
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
    const clearanceMessageBox = document.querySelector(".taxi-clearance-box");
    clearanceBox.innerHTML = `<p>${data.message}</p>`;
    clearanceMessageBox.classList.add("active");

    updateStep(MSG_STATUS.LOADED, data.message);
    updateMessageStatus(state.currentRequest, MSG_STATUS.LOADED);
    
    this.disabled = true;
    console.log(this);
    if (executeButton) executeButton.disabled = false;
    if (cancelExecuteButton) cancelExecuteButton.disabled = false;


  } catch (err) {
    console.error("Network error:", err);
    alert("Error communicating with server.");
  }
}