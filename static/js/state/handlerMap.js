import { loadEvent } from "../events/load.js";
import { executeEvent, cancelExecuteEvent } from "../events/execute.js";
import { actionEvent } from "../events/action.js";

export const handlerMap = {
  load: (btn) => (e) => {
    loadEvent.call(btn, e);
  },
  execute: () => (e) => {
    executeEvent(e);
  },
  cancel: () => (e) => {
    cancelExecuteEvent(e);
  },
  wilco: () => (e) => {
    actionEvent(e);
  },
  standby: () => (e) => {
    actionEvent(e);
  },
  unable: (_) => (e) => {
    actionEvent(e);
  },
};
