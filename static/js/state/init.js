import { state } from "./state.js";
import { getState } from "../api/api.js";
import { displayHistoryLogs } from "../events/filter.js";
import { showSnackbarFromPayload } from "../ui/ui.js";

export const initState = async () => {
  try {
    const data = await getState();

    if (!data.ok) {
      console.warn("State load failed:", data.error || data.status);
      showSnackbarFromPayload(`❌ Failed to load saved state: ${data.error || data.status}`);
      return;
    }

    Object.assign(state, data);
    displayHistoryLogs();
    showSnackbarFromPayload("✅ State successfully loaded", false);

  } catch (error) {
    console.error("Error initializing state:", error);
    showSnackbarFromPayload("❌ Could not connect to server. Offline?");
  }
};
