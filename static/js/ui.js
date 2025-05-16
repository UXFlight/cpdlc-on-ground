export function showTick(tickId) {
  const el = document.getElementById(tickId);
  if (el) el.style.display = "inline";
}

export function hideSpinner(spinnerId) {
  const el = document.getElementById(spinnerId);
  if (el) el.style.display = "none";
}

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
  const p2 = document.createElement('p');
  p2.textContent = message;

  div.append(p1, p2);
  messageBox.prepend(div);
}
