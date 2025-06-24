import { displayHistoryLogs } from "../events/filter.js";

const config = {
    audioNotis : true,
    verboseLogs : false,
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

export const setConfig = () => {
    const toggleSwitch = document.querySelectorAll(".toggle-switch");

    toggleSwitch.forEach((toggle) => {
        const key = toggle.dataset.setting;
        toggle.classList.toggle("active", config[key]);
    })
    return;
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
