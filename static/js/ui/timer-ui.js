const FULL_DASH_ARRAY = 113;
const WARNING_THRESHOLD = 30;
const ALERT_THRESHOLD = 10;

const COLOR_CODES = {
  info: "#3498db",
  warning: "#ffb74d",
  alert: "#ff5252"
};

export function createTimer(requestType, timeLeft, total = 90) {
  const wrapper = document.createElement('div');
  wrapper.className = 'circular-timer';
  wrapper.id = `${requestType}_timer`;

  const percent = timeLeft / total;
  const offset = FULL_DASH_ARRAY * (1 - percent);

  wrapper.innerHTML = `
    <svg viewBox="0 0 40 40">
      <circle class="bg" r="18" cx="20" cy="20"></circle>
      <circle class="progress" r="18" cx="20" cy="20"
        stroke-dasharray="${FULL_DASH_ARRAY}"
        stroke-dashoffset="${offset}"
        stroke="${getColorForTime(timeLeft)}"></circle>
    </svg>
    <div class="time-left">${timeLeft}</div>
  `;

  return wrapper;
}

export function updateTimerVisual(requestType, timeLeft, total = 90) {
  const timer = document.getElementById(`${requestType}_timer`);
  if (!timer) {
    console.warn(`[TIMER] No element found for: ${requestType}_timer`);
    return;
  }

  const percent = timeLeft / total;
  const offset = FULL_DASH_ARRAY * (1 - percent);

  const progress = timer.querySelector('.progress');
  const text = timer.querySelector('.time-left');

  if (progress) {
    progress.setAttribute('stroke-dashoffset', offset);
    progress.setAttribute('stroke', getColorForTime(timeLeft));
  }
  if (text) {
    text.textContent = timeLeft;
  }
}

function getColorForTime(timeLeft) {
  if (timeLeft <= ALERT_THRESHOLD) return COLOR_CODES.alert;
  if (timeLeft <= WARNING_THRESHOLD) return COLOR_CODES.warning;
  return COLOR_CODES.info;
}
