import { state } from "../state/state.js";

export function getRequestPayload(requestType) {
  switch (requestType) {
    case "pushback":
      const direction = state.steps["pushback"].direction;
      if (!direction) throw new Error("Pushback direction not selected");
      return { direction };
    default:
      return {};
  }
}
