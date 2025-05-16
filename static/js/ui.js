
// Creates log message 
export function createLog({ timestamp, action, message }) {

  const messageBox = document.getElementById('message-box');
  const div = document.createElement('div');
  div.classList.add('new-message');
  
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
  
  if (message) {
    const p2 = document.createElement('p');
    p2.classList.add('message-response');
    p2.textContent = `_> ${message}`;
    div.append(p2);
  }
  
  messageBox.prepend(div);
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

export function hideSpinner(spinnerId) {
  const spinner = document.getElementById(spinnerId);
  if (spinner) spinner.style.display = 'none';
}

export function hideTick(tickId) {
  const tick = document.getElementById(tickId);
  if (tick) {
    tick.style.display = 'none';
    tick.classList.remove('error');
  }
}

// buttons functions
export function enableButtons(action) {
  console.log('enableButtons', action);
  switch (action) {

    case 'expected_taxi_clearance':
      document.getElementById('load-button').disabled = false;
      break;
    case 'engine_startup':
      document.getElementById('wilco').disabled = false;
      break;
    case 'pushback':
      document.getElementById('wilco').disabled = false;
      break;
    case 'taxi_clearance':
      document.getElementById('load-button').disabled = false;
      break;
    case 'de_icing':
      document.getElementById('wilco').disabled = false;
      break;
    default:
      break;
  }
}

export function disableExecuteButtons() {
  document.getElementById('execute-button').disabled = true;
  document.getElementById('cancel-execute-button').disabled = true;
}

export function enableWilcoButtons() {
  const buttons = document.querySelectorAll(".action-button");
  buttons.forEach(button => {
      button.disabled = false;
      button.classList.add("active");
  });
}

function disableWilcoButtons() {
  console.log("Disabling Wilco, Standby, and Unable buttons...");
  const buttons = document.querySelectorAll(".action-button");
  buttons.forEach(button => {
      button.disabled = true;
      button.classList.remove("active");
  });
}