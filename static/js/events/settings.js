import { dashboardNeedsRefresh, updateDashboardPanel } from "../state/settingsState.js";

export const settingEvent = (e) => {
  e.preventDefault();
  e.stopPropagation();

  const panel = document.getElementById("settings-panel");
  panel.classList.toggle("active");

  const isVisible = panel.classList.contains("active");
  if (isVisible && dashboardNeedsRefresh()) updateDashboardPanel();
};

export const closeSettingsButton = () => {
  const panel = document.getElementById("settings-panel");
  if (panel.classList.contains("active")) {
    panel.classList.remove("active");
  }
}