import { state } from "../state/state.js";
import { createHistoryLog, clearMessageBox, createGroupedLog } from "../messages/historyLogs.js";

export const filterHistoryLogs = () => {
    clearMessageBox('history-log-box');
    state.isFiltered ? displayNonFilteredLogs() : displayFilteredLogs();
}

function displayNonFilteredLogs() {
    state.isFiltered = false;
    state.history.forEach(log =>{
        log.entries.forEach(entry => {
            createHistoryLog({action : log.label, timestamp : entry.timestamp, message : entry.message});
        })
    })
}

function displayFilteredLogs() {
    state.isFiltered = true;
    clearMessageBox("history-log-box");
    state.history.forEach(group => {
        const latest = group.entries[group.entries.length - 1];
        const container = createGroupedLog({
            stepKey: group.stepKey,
            label: group.label,
            latest: latest,
            history: group.entries
        });
        document.getElementById("history-log-box").append(container);
    });
}