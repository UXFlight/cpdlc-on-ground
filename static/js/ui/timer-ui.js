export function createTimer(requestType, timeLeft, total = 90) {
  const wrapper = document.createElement('div');
  wrapper.className = 'circular-timer';
  wrapper.id = `${requestType}_timer`;

  // Calcul du pourcentage
  const percent = timeLeft / total;
  const offset = 113 - percent * 113;

  wrapper.innerHTML = `
    <svg viewBox="0 0 40 40">
      <circle class="bg" r="18" cx="20" cy="20"></circle>
      <circle class="progress" r="18" cx="20" cy="20"
        stroke-dasharray="113" stroke-dashoffset="${offset}"></circle>
    </svg>
    <div class="time-left">${timeLeft}s</div>
  `;

  return wrapper;
}

export function updateTimerVisual(requestType, timeLeft, total = 90) {
  const wrapper = document.getElementById(`${requestType}_timer`);
  if (!wrapper) return;

  const circle = wrapper.querySelector('.progress');
  const label = wrapper.querySelector('.time-left');
  const percent = timeLeft / total;
  const offset = 113 - percent * 113;

  if (circle) {
    circle.style.strokeDashoffset = offset;
  }

  if (label) {
    label.textContent = `${timeLeft}`;
  }
}
