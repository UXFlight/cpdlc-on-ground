import { state } from "./state.js";

export const dashboardState = {
    sid: null,
    dashboardNeedsRefresh: false,
};

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

export const updateDashboardPanel = () => {
    if (!dashboardState.dashboardNeedsRefresh) return;
    dashboardState.dashboardNeedsRefresh = false;

    document.getElementById("dashboard-sid").textContent = dashboardState.sid ?? "Pilot Settings";
    document.getElementById("dashboard-atc").textContent = state.connection.atc.facility ?? "ATC  Facility";

    // document.getElementById("dashboard-messages").textContent = getMessageCount();
};

// const getMessageCount = () => {
//     return state.history.reduce((count, group) => count + group.entries.length, 0);
// }