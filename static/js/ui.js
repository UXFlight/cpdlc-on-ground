
// Creates log message 
export function createLog({ timestamp, action, message }) {
  if (!action) return;

  const messageBox = document.getElementById('message-box');
  const div = document.createElement('div');
  div.classList.add('new-message', 'flash'); 

  div.dataset.action = action.toLowerCase();
  div.dataset.status = 'open';
  
  const p1 = document.createElement('p');
  const ts = document.createElement('span');
  ts.classList.add('timestamp');
  ts.textContent = timestamp;
  
  const title = document.createElement('span');
  title.classList.add('message-title');
  title.textContent = action;
  
  const status = document.createElement('span');
  status.classList.add('status', 'open');
  status.textContent = 'OPEN';

  p1.append(ts, title, document.createTextNode(' '), status);
  div.append(p1);

  if (message) createResponse(message, div);

  messageBox.prepend(div);

  const sound = document.getElementById('notif-sound');
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(e => console.warn("Audio play failed:", e));
  }

  setTimeout(() => div.classList.remove('flash'), 1000);
}


export function createResponse(message, div) {
  const p2 = document.createElement('p');
  p2.classList.add('message-response');
  p2.textContent = message;
  div.append(p2);
  playNotificationSound();
}

const playNotificationSound = () => {
  const audio = new Audio('/static/mp3/notif.mp3');
  audio.volume = 0.3; 
  audio.play().catch(err => {
    console.warn('Unable to play sound:', err);
  });
};


// loader
export function showSpinner(action) {
  const spinner = document.getElementById(`${action}_spinner`);
  const tick = document.getElementById(`${action}_tick`);
  if (spinner) spinner.style.display = "inline-block";
  if (tick) tick.style.display = "none";
}

export function showTick(action, isError = false) {
  const spinner = document.getElementById(`${action}_spinner`);
  const tick = document.getElementById(`${action}_tick`);
  const wrapper = document.querySelector(`.dropdown[data-action="${action}"]`);

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

// buttons functions
export function enableButtons(action) { // we only enable load button on taxi_clearances
  switch (action) {
    case 'expected_taxi_clearance':
      enableLoadBtn()
      break;
    case 'taxi_clearance':
      enableLoadBtn();
      break;
    default:
      enableActionButtons('wilco');
      break;
  }
}

export function disableExecuteButtons() {
  document.getElementById('execute-button').disabled = true;
  document.getElementById('cancel-execute-button').disabled = true;
}

// enables buttons based on action
// action = load : enables first row
// action = wilco : enables second row
export function enableActionButtons(action) {
  const buttons = document.querySelectorAll(`.${action}-grp`);
  buttons.forEach(button => {
      button.disabled = false;
      button.classList.add("active");
  });
}

export function disableActionButtons(action) {
  const buttons = document.querySelectorAll(`.${action}-grp`);
  buttons.forEach(button => {
      button.disabled = true;
      button.classList.remove("active");
  });
}

// quick utils func
function enableLoadBtn() {
  const loadButton = document.getElementById('load-button');
  if (loadButton) {
    loadButton.disabled = false;
    loadButton.classList.add('active');
  }
}

// functions that handles status of messages
export function updateMessageStatus(action, newStatus) {
  const message = document.querySelector(`.new-message[data-action="${action}"][data-status="open"]`);
  if (!message) return;

  const statusEl = message.querySelector('.status');
  (statusEl);
  if (!statusEl) return;

  statusEl.classList.remove('open', 'closed', 'cancelled');
  statusEl.textContent = newStatus.toUpperCase();
  statusEl.classList.add(newStatus.toLowerCase());

  message.dataset.status = newStatus.toLowerCase();
}

export function markOldMessages(action) {
  const oldMsgs = document.querySelectorAll(`.new-message[data-action="${action}"]`);
  oldMsgs.forEach(msg => msg.classList.add('old-message'));
}

// disable request/ cancel buttons
export function disableAllButtons(action) {
  disableRequestButtons(action);
  disableCancelButtons(action); 
}

export function disableCancelButtons(action) {
  const cancelBtn = document.querySelector(`.cancel-button[data-action="${action}"]`);
  if (cancelBtn) cancelBtn.disabled = true;
}

function disableRequestButtons(action) {
  const requestBtn = document.getElementById(`${action.replace(/_/g, "-")}-btn`);
  if (requestBtn) requestBtn.disabled = true;
}