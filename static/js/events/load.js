import { state, updateStep } from '../state/state.js';
import { MSG_STATUS } from "../state/status.js";
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


    this.disabled = true;
    updateStep(MSG_STATUS.LOAD)

  } catch (err) {
    console.error("Network error:", err);
    alert("Error communicating with server.");
  }
}