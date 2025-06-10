import { state } from "./state.js";
import { getState } from "../api/api.js";
import { displayHistoryLogs } from "../events/filter.js";
import { showSnackbar } from "../ui/ui.js";

export const initState = async () => {
  try {
    const data = await getState();

    if (!data.ok) {
      console.warn("State load failed:", data.error || data.status);
      showSnackbar(`❌ Failed to load saved state: ${data.error || data.status}`);
      return;
    }

    Object.assign(state, data);
    displayHistoryLogs();
    showSnackbar("✅ State successfully loaded", false);

  } catch (error) {
    console.error("Error initializing state:", error);
    showSnackbar("❌ Could not connect to server. Offline?");
  }
};
