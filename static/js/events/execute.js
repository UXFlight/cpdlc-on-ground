import { status } from '../state.js';
import { postExecute } from '../api.js';
import { disableActionButtons, enableActionButtons } from '../buttons-ui.js';

// execute event
export const executeEvent = async (action) => {
  if (!action) return;

  const data = await postExecute(action);

  if (data.error) {
    console.error("Execute error:", data.error);
    return;
  }

  if (data.message === null) return;

  const clearanceBox = document.getElementById('taxi-clearance-message'); // check helpter function that writes on taxi clearance //! NO innerHTML
  clearanceBox.innerHTML = `<p>${data.message}</p>`;

  disableActionButtons(status.LOAD);
  enableActionButtons(status.WILCO);
}


export const cancelExecuteEvent = async (action) => { // for now only enabling load button
    disableActionButtons(status.LOAD);
    enableButtons(action);
}