import { state, status, updateStep } from '../state/state.js';
import { postExecute } from '../api/api.js';
import { disableActionButtons, enableActionButtons, enableButtons } from '../ui/buttons-ui.js';

// execute event
export const executeEvent = async (e) => {
  e.stopPropagation();
  if (!state.currentRequest) return;

  const data = await postExecute(state.currentRequest);

  if (data.error) {
    updateStep(status.ERROR, data.error)
    console.error("Execute error:", data.error);
    return;
  }

  if (data.message === null) return; //! what to do when no taxi clearance sent by ATC ? waiting on it ? timeout ?

  const clearanceBox = document.getElementById('taxi-clearance-message'); // check helpter function that writes on taxi clearance //! NO innerHTML
  clearanceBox.innerHTML = `<p>${data.message}</p>`;

  updateStep(status.EXECUTED, data.message)
  disableActionButtons(status.LOAD);
  enableActionButtons(status.WILCO);
}

export const cancelExecuteEvent = async (e) => {
  e.stopPropagation();
  disableActionButtons(status.LOAD);
  enableButtons(state.currentRequest);
};
