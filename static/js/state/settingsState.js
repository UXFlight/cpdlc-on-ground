import { MSG_STATUS } from "../utils/consts/status.js";
import { state } from "./state.js";

export const dashboardState = {
    sid: null,
    avgReply: null,
    latency: null,
    successRate: null,
    dashboardNeedsRefresh: false,
    connectionTimer: null
};

export function manageConnectionTimer(enable) {
    if (!enable) {
        clearInterval(dashboardState.connectionTimer);
        dashboardState.connectionTimer = null;
        return;
    }

    if (dashboardState.connectionTimer !== null) return; 
    dashboardState.connectionTimer = setInterval(() => {
        updateConnectionTime();
    }, 1000);
}

export function dashboardNeedsRefresh() {
    return dashboardState.dashboardNeedsRefresh;
}

export function setConnectionInfos(sid, connectedSince) {
    dashboardState.sid = sid;
    state.connection.connectedSince = connectedSince;
    markDashboardReady();
}

export function markDashboardReady() {
    const panel = document.getElementById('settings-panel');
    dashboardState.dashboardNeedsRefresh = true;
    if (panel && panel.classList.contains('active')) updateDashboardPanel();
}

export function updateConnectionTime() {
    const duration = getHumanDuration(state.connection.connectedSince);
    document.getElementById("dashboard-connection").textContent = duration;
}

export const updateDashboardPanel = () => {
    if (!dashboardState.dashboardNeedsRefresh) return;
    dashboardState.dashboardNeedsRefresh = false;

    document.getElementById("dashboard-sid").textContent = dashboardState.sid ?? "Pilot Settings";
    document.getElementById("dashboard-atc").textContent = state.connection.atc.facility ?? "ATC  Facility";

    updateConnectionTime();

    document.getElementById("dashboard-messages").textContent = getMessageCount();
    document.getElementById("dashboard-reply").textContent = dashboardState.avgReply ? `${dashboardState.avgReply}s` : "—";
    document.getElementById("dashboard-latency").textContent = formatLatency(dashboardState.latency);
    document.getElementById("dashboard-success-value").textContent = updateSuccessGauge();
};

const getHumanDuration = (since) => {
    if (!since) return "—";
    const ms = Date.now() - since;
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const hrs = Math.floor(min / 60);

    if (hrs > 0) return `${hrs}h ${min % 60}m`;
    if (min > 0) return `${min}m ${sec % 60}s`;
    return `${sec}s`;
};

const formatLatency = (ms) => {
    if (ms === null || ms === undefined) return "—";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
};

const getMessageCount = () => {
    return state.history.reduce((count, group) => count + group.entries.length, 0);
}

export const updateSuccessGauge = () => {
    const isNotValid = new Set([
        MSG_STATUS.CANCEL,
        MSG_STATUS.CANCELLED,
        MSG_STATUS.ERROR,
        MSG_STATUS.STANDBY,
        MSG_STATUS.TIMEOUT,
        MSG_STATUS.UNABLE
    ]);

    const allEntries = state.history.flatMap(group => group.entries);
    const validCount = allEntries.filter(e => e.status && !isNotValid.has(e.status)).length;
    const totalCount = allEntries.length;

    const percent = totalCount > 0 ? (validCount / totalCount) * 100 : null;
    const displayValue = percent !== null ? `${percent.toFixed(1)}%` : "—";

    const ringContainer = document.getElementById("success-ring-container");
    if (ringContainer) {
        ringContainer.style.setProperty("--performance", percent !== null ? percent.toFixed(1) : 0);

        ringContainer.classList.remove("low", "mid", "high", "excel");

        if (percent === null) {
        } else if (percent >= 90) {
            ringContainer.classList.add("excel");
        } else if (percent >= 70) {
            ringContainer.classList.add("high");
        } else if (percent >= 50) {
            ringContainer.classList.add("mid");
        } else {
            ringContainer.classList.add("low");
        }
    }

    const info = document.getElementById("dashboard-success-info");

    if (!percent) {
        info.textContent = "Awaiting communication activity.";
    } else if (percent >= 90) {
        info.textContent = "Excellent communication with ATC.";
    } else if (percent >= 70) {
        info.textContent = "Good performance. Keep it up.";
    } else {
        info.textContent = "Consider improving communication consistency.";
    }

    return displayValue;
};