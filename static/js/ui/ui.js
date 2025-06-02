
// loader
export function showSpinner(action) {
  const spinner = document.getElementById(`${action}_spinner`);
  const tick = document.getElementById(`${action}_tick`);
  if (spinner) spinner.style.display = "inline-block";
  if (tick) tick.style.display = "none";
}

export function showTick(action, isError = false) {
  console.log("showTick called for action:", action, "isError:", isError);
  const spinner = document.getElementById(`${action}_spinner`);
  const tick = document.getElementById(`${action}_tick`);
  const wrapper = document.querySelector(`.overlay[data-action="${action}"]`);

  if (spinner) spinner.style.display = "none";

  if (tick) {
    tick.style.display = "inline-block";
    if (isError) {
      tick.textContent = "✖";
      tick.classList.add('error');
      tick.classList.remove('success');
    } else {
      tick.textContent = "✔"; 
      tick.classList.add('success');
      tick.classList.remove('error');
    }
  }
  if (wrapper) {
    wrapper.setAttribute('data-status', isError ? 'error' : 'fulfilled');
  }
}

export function hideSpinner(action) {
  const spinner = document.getElementById(`${action}_spinner`);
  if (spinner) spinner.style.display = "none";
}

export function hideTick(tickId) {
  const tick = document.getElementById(tickId);
  if (tick) {
    tick.style.display = 'none';
    tick.classList.remove('error');
  }
}

export function changeFilterIcon() {
  const svg = document.getElementById("filter-icon");
  if(svg) svg.classList.toggle("filtered");
}

export function ensureMessageBoxNotEmpty(divId='history-log-box') {
  const historyLogBox = document.getElementById(divId);
  const noMessages = document.getElementById('empty-history-message');
  if (historyLogBox.classList.contains('empty')) {
      historyLogBox.classList.remove('empty');
      noMessages?.classList.add('hidden');
  }
}

export function clearMessageBox(boxId='history-log-box') {
  ensureMessageBoxNotEmpty();
  const box = document.getElementById(boxId);
  if (box) box.innerHTML = '';
}


export function playNotificationSound() {
    const audio = new Audio('/static/mp3/notif.mp3');
    audio.volume = 0.3;
    audio.play().catch(err => console.warn('Unable to play sound:', err));
}

export function flashElement(div) {
    div.classList.add('flash');
    setTimeout(() => div.classList.remove('flash'), 1000);
}

export function updateTaxiClearanceMsg(message = null) {
  const clearanceBox = document.getElementById('taxi-clearance-message');
  const clearanceMessageBox = document.querySelector(".taxi-clearance-box");
  clearanceBox.innerHTML = `<p>${message}</p>`;
  message ? clearanceMessageBox.classList.add("active") : clearanceMessageBox.classList.remove("active");
}