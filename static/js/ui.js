
// Creates log message 
export function createLog({ timestamp, action, message }) {

  const messageBox = document.getElementById('message-box');
  const div = document.createElement('div');
  div.classList.add('new-message');

  // to access the message in the UI
  div.classList.add('new-message');
  div.dataset.action = action.toLowerCase();
  div.dataset.status = 'open';
  
  const p1 = document.createElement('p');
  const ts = document.createElement('span');
  ts.classList.add('timestamp');
  ts.textContent = timestamp;
  
  const sep = document.createTextNode(' | ');
  
  const title = document.createElement('span');
  title.classList.add('message-title');
  title.textContent = action;
  
  const status = document.createElement('span');
  status.classList.add('status', 'open');
  status.textContent = 'OPEN';
  
  p1.append(ts, sep, title, document.createTextNode(' '), status);
  div.append(p1);
  
  if (message) createResponse(message, div);
  
  messageBox.prepend(div);
}

export function createResponse(message, div) {
  const p2 = document.createElement('p');
  p2.classList.add('message-response');
  p2.textContent = `_> ${message}`;
  div.append(p2);
}

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

  if (spinner) spinner.style.display = "none";
  if (tick) tick.style.display = "inline-block";

  if (isError) {
    tick.textContent = "✖";
    tick.style.color = "red";
    tick.classList.add('error');
    tick.classList.remove('success');
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
    case 'engine_startup':
      enableActionButtons('wilco');
      break;
    case 'pushback':
      enableActionButtons('wilco');
      break;
    case 'taxi_clearance':
      enableLoadBtn();
      break;
    case 'de_icing':
      enableActionButtons('wilco');
      break;
    default:
      // helper function that displays error modal
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
