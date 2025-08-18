// all events imported
import { sendRequestEvent } from './events/sendRequest.js';
import { cancelRequestEvent } from './events/cancelRequest.js';
import { toggleOverlay, touchStartEvent, handleGlobalClick, touchFeedbackButtons, closeSettings } from './events/overlay.js';
import { selectPushbackDirection } from './events/pushbackDirection.js';
import { setupSocketListeners } from './socket/socket-listens.js';
import { settingEvent } from './events/settings.js';
import { updateDashboardPanel } from './state/settingsState.js';
import { toggleSwitchEvent, setConfig } from './state/configState.js';
import { closeSettingsButton } from './events/settings.js';
import { downloadReport } from './events/downloadStats.js';
import { initVoice } from './text-to-speech.js/speech.js';

document.addEventListener("DOMContentLoaded", () => {
  setConfig();
  updateDashboardPanel()
  setupSocketListeners() // ok
  listenToButtonEvents(); // ok
  listenToGlobalClickEvents(); // ok
  listenToHeaderEvents();
  initVoice();
});

function listenToGlobalClickEvents() {
  const overlays = document.querySelectorAll(".overlay");

  overlays.forEach(overlay => {
    overlay.addEventListener("click", () => toggleOverlay(overlay));
  });

  document.addEventListener("click", handleGlobalClick);
  document.addEventListener("touchstart", (e) => {
    touchStartEvent(e);         // overlays
    touchFeedbackButtons(e);    // req/cancel btns
  });

  document.addEventListener("keydown", (event) => closeSettings(event));
}

function listenToButtonEvents() {
  const requestButtons = document.querySelectorAll(".request-button");
  const cancelButtons = document.querySelectorAll(".cancel-button");

  const leftButton = document.getElementById("pushback-left");
  const rightButton = document.getElementById("pushback-right");

  const settingsIcon = document.getElementById("settings-icon");

  const downloadBtn = document.getElementById("download-btn");

  const toggleButtons = document.querySelectorAll(".toggle-switch");

  const closeSettings = document.getElementById('close-button');

  // request buttons
  requestButtons.forEach(btn => {
    btn.addEventListener("click", function (e) {
      sendRequestEvent.call(this, e);
    });
  });

  // cancel buttons
  cancelButtons.forEach(btn => {
    btn.addEventListener("click", function (e) {
      cancelRequestEvent.call(this, e);
    });
  });

  // left/ right pushback event
  leftButton.addEventListener("click", (e) => selectPushbackDirection(e));
  rightButton.addEventListener("click", (e) => selectPushbackDirection(e));

  // settings icon event
  settingsIcon.addEventListener("click", (e) => settingEvent(e));

  // download btn event
  downloadBtn.addEventListener("click", (e) => downloadReport())

  // toggle switch event
  toggleButtons.forEach(btn => {
    btn.addEventListener("click", (e) => toggleSwitchEvent(e));
  });
  
  closeSettings.addEventListener('click', () => closeSettingsButton());
}

export function listenToHeaderEvents() {
  const connectionStatus = document.getElementById('connection-status');
  connectionStatus.addEventListener('click', () => connectionStatus.classList.toggle('show-tooltip'));
}