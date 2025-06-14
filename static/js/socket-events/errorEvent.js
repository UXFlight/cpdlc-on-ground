import { updateStep } from "../state/state.js"
import { showSnackbarFromPayload } from "../ui/ui.js"

export const handleError = (payload) => {
    if (!payload) return;
    showSnackbarFromPayload(payload);
};
