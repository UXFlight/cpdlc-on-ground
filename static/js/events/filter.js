import { state } from "../state/state.js";
import { createGroupedLog } from "../messages/historyLogs.js";
import { changeFilterIcon, clearMessageBox } from "../ui/ui.js";
import { MSG_STATUS } from '../utils/consts/status.js';
import { STATUS_PRIORITY } from "../utils/consts/priorityConsts.js";

export const filterHistoryLogs = () => {
  const hasClosableLogs = state.history.some(
    log => [MSG_STATUS.CLOSED, MSG_STATUS.UNABLE].includes(
      log.entries[log.entries.length - 1].status
    )
  );

  if (hasClosableLogs) changeFilterIcon();

  state.isFiltered = !state.isFiltered;
  changeFilterIcon();
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
    ? logs
    : logs.filter(log =>
        ![MSG_STATUS.CLOSED, MSG_STATUS.UNABLE].includes(log.latest.status)
      );

  visibleLogs.sort((a, b) => {
    const dateA = new Date(a.latest.timestamp);
    const dateB = new Date(b.latest.timestamp);

    if (dateA.getTime() !== dateB.getTime()) return dateB - dateA;

    const pA = STATUS_PRIORITY[a.latest.status] ?? -99;
    const pB = STATUS_PRIORITY[b.latest.status] ?? -99;

    return pB - pA;
  });

  visibleLogs.forEach(createGroupedLog);
};
