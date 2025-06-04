import { state } from "../state/state.js";
import { createHistoryLog, createGroupedLog } from "../messages/historyLogs.js";
import { changeFilterIcon, clearMessageBox } from "../ui/ui.js";
import { MSG_STATUS } from "../state/status.js";

export const filterHistoryLogs = () => {
  state.isFiltered ?  displayFilteredLogs() : displayNonFilteredLogs();
}

function displayNonFilteredLogs() {
    changeFilterIcon();
    clearMessageBox();

    const allEntries = state.history.reduce((acc, log) => {
      const entries = log.entries.map(entry => ({
        action: log.label,
        timestamp: entry.timestamp,
        message: entry.message,
        status: entry.status,
      }));
      return acc.concat(entries);
    }, []);
  
    allEntries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); //? is it needed ?

  
    allEntries.forEach(entry => {
      createHistoryLog(
        entry.action,
        entry.timestamp,
        entry.message,
        entry.status
      );
  });
}
  
export function displayFilteredLogs() {
    changeFilterIcon();
    clearMessageBox();


    const sortedGroups = [...state.history].sort((a, b) => {
      const entryA = a.entries[a.entries.length - 1];
      const entryB = b.entries[b.entries.length - 1];
  
      const isRespondedA = entryA.status === MSG_STATUS.RESPONDED;
      const isRespondedB = entryB.status ===MSG_STATUS.RESPONDED;
  
      if (isRespondedA !== isRespondedB) return isRespondedB - isRespondedA;  
      return new Date(entryB.timestamp) - new Date(entryA.timestamp);
    });

    sortedGroups.forEach(group => {
      const latest = group.entries[group.entries.length - 1];
      createGroupedLog({
          stepKey: group.stepKey,
          label: group.label,
          latest,
          history: group.entries
      });
  });
}
  