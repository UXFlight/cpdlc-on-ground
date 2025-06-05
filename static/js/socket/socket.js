import { SERVER_URL } from "../utils/consts.js";

const socket = io(SERVER_URL); //! single connection for each pilot

function send(event, data) {
  socket.emit(event, data);
}

function listen(event, callback) {
  socket.on(event, callback);
}

export { send, listen, socket };
