import { listen } from "./socket.js";
import { handleAtcResponse } from "../socket-events/atcResponse.js";
import { renderConnectionState } from "../socket-events/connectionEvents.js";
import { tickUpdate, timeoutEvent } from "../socket-events/timeoutEvent.js";
import { state } from "../state/state.js";
import { enableAllRequestButtons, disableAllRequestButtons } from "../ui/buttons-ui.js";
import { handleActionResponse } from "../socket-events/actionResponse.js";
import { SOCKET_LISTENS } from "../utils/consts.js";
import { handleRequestAck } from "../socket-events/requestResponse.js";
import { handleError } from "../socket-events/errorEvent.js";

export function setupSocketListeners() {
  listen(SOCKET_LISTENS.CONNECT, () => {
    state.connection.backend = "connected";
    renderConnectionState(state.connection);
    enableAllRequestButtons();
  });

  listen(SOCKET_LISTENS.DISCONNECT, () => {
    state.connection.backend = "disconnected";
    state.connection.atc.status = "disconnected";
    state.connection.atc.facility = null;
    renderConnectionState(state.connection);
    disableAllRequestButtons();
  });

  listen(SOCKET_LISTENS.CONNECTED_TO_ATC, (data) => {
    state.connection.atc.status = "connected";
    state.connection.atc.facility = data.facility;
    renderConnectionState(state.connection);
  });

  listen(SOCKET_LISTENS.DISCONNECTED_FROM_ATC, () => {
    state.connection.atc.status = "disconnected";
    state.connection.atc.facility = null;
    renderConnectionState(state.connection);
  });

  listen(SOCKET_LISTENS.ATC_RESPONSE, handleAtcResponse);
  listen(SOCKET_LISTENS.TICK, tickUpdate);
  listen(SOCKET_LISTENS.TIMEOUT, timeoutEvent);
  listen(SOCKET_LISTENS.ACTION_ACK, handleActionResponse);
  listen(SOCKET_LISTENS.REQUEST_ACK, handleRequestAck);
  listen(SOCKET_LISTENS.ERROR, handleError);

}
