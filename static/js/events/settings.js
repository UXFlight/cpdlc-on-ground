import { dashboardNeedsRefresh, updateDashboardPanel, manageConnectionTimer } from "../state/settingsState.js";

export const settingEvent = (e) => {
  e.preventDefault();
  e.stopPropagation();

  const panel = document.getElementById("settings-panel");
  panel.classList.toggle("active");

  const isVisible = panel.classList.contains("active");

  manageConnectionTimer(isVisible);
  if (isVisible && dashboardNeedsRefresh()) updateDashboardPanel();
};

export const closeSettingsButton = () => {
  const panel = document.getElementById("settings-panel");
  if (panel.classList.contains("active")) {
    panel.classList.remove("active");
    manageConnectionTimer(false);
  }
}