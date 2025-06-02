import { state, updateStep } from '../state/state.js';
import { MSG_STATUS } from "../state/status.js";
import { postAction } from "../api/api.js";
import { updateTaxiClearanceMsg } from '../ui/ui.js';

export async function loadEvent(e, action) {
  const executeButton = document.getElementById(`execute-button-${action}`);
  const cancelExecuteButton = document.getElementById(`cancel-execute-button-${action}`);

  e.stopPropagation();
  if (!state.currentRequest) return;

  try {
    const data = await postAction(MSG_STATUS.LOAD, state.currentRequest);

    if (data.error) {
      console.error("Load error:", data.error);
      return;
    }

    if (data.message === null) return;

    // create taxi clearance message
    updateTaxiClearanceMsg(data.message);
    updateStep(MSG_STATUS.LOADED, data.message);
    
    this.disabled = true;
    if (executeButton) executeButton.disabled = false;
    if (cancelExecuteButton) cancelExecuteButton.disabled = false;


  } catch (err) {
    console.error("Network error:", err);
    alert("Error communicating with server.");
  }
}