import { displayHistoryLogs } from "../events/filter.js";

const config = {
    audioNotis : true,
    utcDisplay: false,
    tempReadings : false,
    verboseLogs : true,
    autoAck : false,
    autoRetry : false,
}

export const CONFIG_KEYS = {
    AUDIO: "audioNotis",
    UTC: "utcDisplay",
    TEMPERATURE: "tempReadings",
    LOGS: "verboseLogs",
    ACK: "autoAck",
    RETRY: "autoRetry"
}

export const toggleSwitchEvent = (e) => {
    const target = e.target.closest(".toggle-switch");
    const key = target?.dataset.setting;
    if (target) target.classList.toggle("active");
    if (key) config[key] = !config[key];
    if (key === CONFIG_KEYS.LOGS) displayHistoryLogs()
}

export const getBool = (key) =>{
    return config[key];
}