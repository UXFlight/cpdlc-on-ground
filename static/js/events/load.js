import { enableActionButtons } from "../ui/buttons-ui.js";
import { state, status, updateStep } from '../state/state.js';
import { postLoad } from "../api/api.js";

export async function loadEvent(e) {
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
    clearanceBox.innerHTML = `<p>${data.message}</p>`;

    const clearanceMessageBox = document.querySelector(".taxi-clearance-box");
    clearanceMessageBox.classList.add("active");

    if(state.currentRequest === 'taxi_clearance') enableActionButtons(status.LOAD);
    else enableActionButtons(status.WILCO);

    this.disabled = true;
    // state.steps[state.currentRequest].status = status.LOAD; // temp ? 
    updateStep(status.LOAD)

  } catch (err) {
    console.error("Network error:", err);
    alert("Error communicating with server.");
  }
}