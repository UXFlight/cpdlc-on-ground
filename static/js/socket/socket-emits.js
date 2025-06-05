import { send } from "./socket.js";
import { SOCKET_EMITS } from "../utils/consts.js";

export function emitRequest(requestType) {
  send(SOCKET_EMITS.SEND_REQUEST, { requestType });
}

export function emitCancelRequest(requestType) {
  send(SOCKET_EMITS.CANCEL_REQUEST, { requestType });
}

export function emitAction(action, requestType) {
  send(SOCKET_EMITS.SEND_ACTION, { action, requestType });
}

export function emitGetState() {
  send("getState");
}
