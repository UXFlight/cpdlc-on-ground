export const SERVER_URL = "http://localhost:5321"; 

export const SOCKET_EMITS = {
    SEND_REQUEST: "sendRequest",
    CANCEL_REQUEST: "cancelRequest",
    SEND_ACTION: "sendAction",
    REQUEST_CANCELLED: "requestCancelled",
    GET_STATE: "getState",
};

export const SOCKET_LISTENS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECTED_TO_ATC: "connectedToATC",
  DISCONNECTED_FROM_ATC: "disconnectedFromATC",
  TICK: "tick",
  TIMEOUT: "timeout",
  ATC_RESPONSE: "atcResponse",
  ACTION_ACK: "actionAcknowledged",
  REQUEST_ACK: "requestAcknowledged",
  ERROR: "error",

}