import { state } from "../state/state.js";
import { createGroupedLog } from "../messages/historyLogs.js";
import { changeFilterIcon, clearMessageBox } from "../ui/ui.js";
import { MSG_STATUS } from '../utils/consts/status.js';
import { STATUS_PRIORITY } from "../utils/consts/priorityConsts.js";

export const filterEvent = () => {
  const hasClosableLogs = state.history.some(
    log => [MSG_STATUS.CLOSED, MSG_STATUS.UNABLE].includes(
      log.entries[log.entries.length - 1].status
    )
  );

  if (!hasClosableLogs) return;
  state.isFiltered = !state.isFiltered;
  displayHistoryLogs()
  changeFilterIcon();
}

export const displayHistoryLogs = () => {
  clearMessageBox();
  const logs = state.history.map(group => {
    const latest = group.entries[group.entries.length - 1];
    return {
      stepKey: group.stepKey,
      label: group.label,
      latest,
      history: group.entries,
    };
  });


  const visibleLogs = state.isFiltered
    ? logs.filter(log =>
        ![MSG_STATUS.CLOSED, MSG_STATUS.UNABLE, MSG_STATUS.CANCEL, MSG_STATUS.CANCELLED, MSG_STATUS.ERROR, MSG_STATUS.TIMEOUT].includes(log.latest.status)
      )
    : logs;

  visibleLogs.sort((a, b) => {
    const pA = STATUS_PRIORITY[a.latest.status] ?? -99;
    const pB = STATUS_PRIORITY[b.latest.status] ?? -99;

    if (pA !== pB) return pA - pB;
    const tA = a.latest.timestamp ?? -1;
    const tB = b.latest.timestamp ?? -1;
  
    return tB - tA;
  });
    

  visibleLogs.forEach(createGroupedLog);
};
