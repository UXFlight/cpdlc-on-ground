import { state, status, updateStep } from '../state.js';
import { postExecute } from '../api.js';
import { disableActionButtons, enableActionButtons } from '../buttons-ui.js';

// execute event
export const executeEvent = async () => {
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

export const cancelExecuteEvent = async () => {
  disableActionButtons(status.LOAD);
  enableButtons(state.currentRequest);
};
