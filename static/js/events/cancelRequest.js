import { hideSpinner } from "../ui/ui.js";
import { enableAllRequestButtons } from "../ui/buttons-ui.js";
import { updateDirection, updateStep } from '../state/state.js';
import { MSG_STATUS } from "../state/status.js";
import { filterHistoryLogs } from "./filter.js";
import { postCancelRequest } from "../api/api.js";

export async function cancelRequestEvent(action) {
  if (!action || this.disabled) return;

  try {

    const data = await postCancelRequest(action);

    if (!data.ok) {
      console.warn("Cancel failed:", data.error);
      updateStep(MSG_STATUS.ERROR, `Cancel failed: ${data.error}`);
      return;
    }

    updateStep(MSG_STATUS.CANCELLED, data.message || MSG_STATUS.CANCELLED);
    this.disabled = true;

    const requestBtn = document.getElementById(`${action.replace(/_/g, "-")}-btn`);
    if (requestBtn) {
      requestBtn.disabled = false;
      requestBtn.classList.remove("active");
    }

    if (action === "pushback") {
      document.getElementById("pushback-left")?.classList.remove("active");
      document.getElementById("pushback-right")?.classList.remove("active");
      updateDirection(null);
    }

    filterHistoryLogs();
    hideSpinner(action);
    enableAllRequestButtons();
  } catch (err) {
    console.error("Cancel error:", err);
    updateStep(MSG_STATUS.ERROR, "Network error during cancellation");
  }
}
