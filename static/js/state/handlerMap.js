import { loadEvent } from "../events/load.js";
import { executeEvent, cancelExecuteEvent } from "../events/execute.js";
import { actionEvent } from "../events/action.js";
import { MSG_STATUS } from "./status.js";

export const handlerMap = {
  load: (btn, action) => (e) => {
    loadEvent.call(btn, e, action);  // si loadEvent a besoin d'action
  },
  execute: (_, action) => (e) => {
    executeEvent(e, action); // idem ici
  },
  cancel: (_, action) => (e) => {
    cancelExecuteEvent(e, action);
  },
  wilco: (_, action) => (e) => {
    actionEvent(e, action, MSG_STATUS.WILCO);
  },
  standby: (_, action) => (e) => {
    actionEvent(e, action, MSG_STATUS.STANDBY);
  },
  unable: (_, action) => (e) => {
    actionEvent(e, action, MSG_STATUS.UNABLE);
  },
};
