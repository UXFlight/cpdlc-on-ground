//DOM UTILITIES //
const historyLogBox = document.getElementById('history-log-box');
const noMessages = document.getElementById('empty-history-message');

function ensureMessageBoxNotEmpty() {
    if (historyLogBox.classList.contains('empty')) {
        historyLogBox.classList.remove('empty');
        noMessages?.classList.add('hidden');
    }
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

export function createHistoryLog({ action, timestamp, message, status = 'NEW' }) {
    if (!action) return;
    ensureMessageBoxNotEmpty();

    const normalizedStatus = status.toLowerCase();

    const div = document.createElement('div');
    div.classList.add('new-message');
    div.dataset.action = action.toLowerCase();
    div.dataset.status = normalizedStatus;

    const header = createHeader({ timestamp, title: action, status: normalizedStatus });
    div.appendChild(header);

    if (message) {
        const response = createResponseParagraph(message);
        div.appendChild(response);
    }

    historyLogBox.prepend(div);
    flashElement(div);
}

// GROUPED MESSAGE //
import { state } from '../state/state.js';

export function appendToLog(stepKey, message, timestamp) {
    console.log('history', state.history);
    const group = state.history.find(g => g.stepKey === stepKey);
    console.log('group', group)

    const newEntry = {
        status: 'new',
        message,
        timestamp
    };

    if (group) {
        const latest = group.entries[group.entries.length - 1];
        return refreshGroupedLog(group, latest);
    }

    const label = state.steps[stepKey]?.label || stepKey;
    const newGroup = {
        stepKey,
        label,
        entries: [newEntry]
    };
    state.history.push(newGroup);
    createGroupedLog({ ...newGroup, latest: newEntry, history: newGroup.entries });
}

export function refreshGroupedLog(group, latest) {
    const old = document.querySelector(`.new-message[data-action="${group.stepKey}"]`);
    if (old) old.remove();

    createGroupedLog({
        stepKey: group.stepKey,
        label: group.label,
        latest,
        history: group.entries
    });
}
  

export function createGroupedLog({ stepKey, label, latest, history }) {
    ensureMessageBoxNotEmpty();

    const div = document.createElement('div');
    div.classList.add('new-message');
    div.dataset.action = stepKey;
    div.dataset.status = latest.status;
    div.style.cursor = 'pointer';

    const toggle = document.createElement('span');
    toggle.textContent = '▾';
    toggle.classList.add('toggle-arrow');
    toggle.style.marginLeft = '10px';

    const header = createHeader({ timestamp: latest.timestamp, title: label, status: latest.status });
    header.appendChild(toggle);
    div.appendChild(header);

    if (latest.message) {
        const response = createResponseParagraph(latest.message);
        div.appendChild(response);
    }

    const historyContainer = createHistoryDetails(history.slice(0, -1));
    div.appendChild(historyContainer);

    div.addEventListener("click", (e) => toggleMessage(e, historyContainer, toggle));
    historyLogBox.prepend(div);
    flashElement(div);
}

const toggleMessage = (e, historyContainer, toggle)=> { 
    e.stopPropagation();
    const isOpen = historyContainer.style.display ==='block';
    historyContainer.style.display = isOpen ? 'none' : 'block';
    toggle.textContent = isOpen ? '▾' : '▴';
}

// SUBCOMPONENTS //
function createHeader({ timestamp, title, status }) {
    const p = document.createElement('p');

    const ts = document.createElement('span');
    ts.classList.add('timestamp');
    ts.textContent = timestamp;

    const titleEl = document.createElement('span');
    titleEl.classList.add('message-title');
    titleEl.textContent = title;

    const statusEl = document.createElement('span');
    statusEl.classList.add('status', status); 
    statusEl.textContent = status.toUpperCase();

    p.append(ts, titleEl, document.createTextNode(' '), statusEl);
    return p;
}


function createResponseParagraph(message) {
    const p = document.createElement('p');
    p.className = 'message-response';
    p.textContent = message;
    return p;
}

function createHistoryDetails(historyEntries) {
    const container = document.createElement('div');
    container.className = 'history-details';
    container.style.display = 'none';

    historyEntries.forEach(entry => {
        const p = document.createElement('p');
        p.className = 'message-response';
        p.innerText = `${entry.timestamp} → ${entry.status.toUpperCase()}: ${entry.message || "—"}`;
        container.appendChild(p);
    });

    return container;
}

// MESSAGE RESPONSE INSERTION //
export function createResponse(message, div) {
    const response = createResponseParagraph(message);
    div.append(response);
}

// STATUS UPDATER //
export function updateMessageStatus(action, newStatus) {
    const message = document.querySelector(`.new-message[data-action="${action}"][data-status="new"]`);
    if (!message) return;

    const statusEl = message.querySelector('.status');
    if (!statusEl) return;

    statusEl.classList.remove('new', 'closed', 'cancelled'); // extend here if needed
    statusEl.textContent = newStatus.toUpperCase();
    statusEl.classList.add(newStatus.toLowerCase());

    message.dataset.status = newStatus.toLowerCase();
}

// UTILS //
export function clearMessageBox(boxId) {
    const box = document.getElementById(boxId);
    if (box) box.innerHTML = '';
}
