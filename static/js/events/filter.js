import { state } from "../state/state.js";
import { createHistoryLog, createGroupedLog } from "../messages/historyLogs.js";
import { changeFilterIcon, clearMessageBox } from "../ui/ui.js";

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

    const sortedGroups = [...state.history].sort((a, b) => { //* copied array
        const ta = a.entries[a.entries.length - 1].timestamp;
        const tb = b.entries[b.entries.length - 1].timestamp;
        return new Date(ta) - new Date(tb); 
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
  