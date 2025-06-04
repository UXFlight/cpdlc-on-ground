import { hideSpinner } from "../ui/ui.js";
import { enableAllRequestButtons } from "../ui/buttons-ui.js";
import { updateDirection, updateStep } from '../state/state.js';
import { MSG_STATUS } from "../state/status.js";
import { filterHistoryLogs } from "./filter.js";
import { postCancelRequest } from "../api/api.js";
import { getRequestTypeFromEvent } from "../utils/utils.js";

export async function cancelRequestEvent(e) {
  e.preventDefault();
  e.stopPropagation();
  const requestType = getRequestTypeFromEvent(e);
  if (!requestType || this.disabled) return;
  const requestBtn = document.getElementById(`${requestType.replace(/_/g, "-")}-btn`);

  try {
    const data = await postCancelRequest(requestType);
    updateStep(requestType, MSG_STATUS.CANCELLED, data.message || MSG_STATUS.CANCELLED);
    this.disabled = true;

    if (requestBtn) {
      requestBtn.disabled = false;
      requestBtn.classList.remove("active");
    }

    if (requestType === "pushback") {
      document.getElementById("pushback-left")?.classList.remove("active");
      document.getElementById("pushback-right")?.classList.remove("active");
      updateDirection(null);
    }

    filterHistoryLogs();
    hideSpinner(requestType);
    enableAllRequestButtons();
  } catch (err) {
    console.error("Cancel error:", err);
    updateStep(requestType, MSG_STATUS.ERROR, "Network error during cancellation");
  }
}
