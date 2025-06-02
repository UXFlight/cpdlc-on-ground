import { state, updateStep } from "../state/state.js";
import { appendToLog } from "../messages/historyLogs.js";
import { filterHistoryLogs } from "../events/filter.js";

export const handleAtcResponse = (data) => {
    updateStep(data.status, data.message);
    if(state.isFiltered) return appendToLog(data.action, data.timestamp, data.message, data.status);
    state.isFiltered = true;
    filterHistoryLogs();
}