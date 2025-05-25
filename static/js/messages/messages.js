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

// response from ATC
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

// functions that handles status of messages
export function updateMessageStatus(action, newStatus) {
    const message = document.querySelector(`.new-message[data-action="${action}"][data-status="open"]`);
    if (!message) return;

    const statusEl = message.querySelector('.status');
    (statusEl);
    if (!statusEl) return;

    statusEl.classList.remove('open', 'closed', 'cancelled'); //! will updated status with loaded, executed, etc
    statusEl.textContent = newStatus.toUpperCase();
    statusEl.classList.add(newStatus.toLowerCase());

    message.dataset.status = newStatus.toLowerCase();
}

export function markOldMessages(action) {
    const oldMsgs = document.querySelectorAll(`.new-message[data-action="${action}"]`);
    oldMsgs.forEach(msg => msg.classList.add('old-message'));
}