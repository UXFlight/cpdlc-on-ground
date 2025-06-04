import { MSG_STATUS } from '../state/status.js';
import { state } from '../state/state.js';
import { flashElement, formatRequestType } from '../ui/ui.js';
import { createButton } from '../ui/buttons-ui.js';
import { createTimer } from '../ui/timer-ui.js';

//DOM UTILITIES //
const historyLogBox = document.getElementById('history-log-box');

export function createHistoryLog(requestType, timestamp, message, status = MSG_STATUS.REQUESTED) {
    if (!requestType) return;

    const normalizedStatus = status.toLowerCase();

    const div = document.createElement('div');
    div.classList.add('new-message');
    div.dataset.requesttype = requestType.toLowerCase();
    div.dataset.status = normalizedStatus;

    const header = createHeader({ timestamp, title: requestType, status: normalizedStatus });
    div.appendChild(header);

    if (message) div.appendChild(createResponseParagraph(message))

    historyLogBox.prepend(div);
    flashElement(div);
}

export function appendToLog(stepKey, message, timestamp, status = MSG_STATUS.NEW) {
    const group = state.history.find(g => g.stepKey === stepKey);
    const newEntry = {
        status,
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
    const old = document.querySelector(`.new-message[data-requesttype="${group.stepKey}"]`);
    if (old) old.remove();

    createGroupedLog({
        stepKey: group.stepKey,
        label: group.label,
        latest,
        history: group.entries
    });
}
  
export function createGroupedLog({ stepKey, label, latest, history }) {
    const div = document.createElement('div');
    div.classList.add('new-message');
    div.dataset.requesttype = stepKey;
    div.dataset.status = latest.status;
    div.style.cursor = 'pointer';

    
    const historyContainer = createHistoryDetails(history.slice(0, -1));
    const header = createHeader({ timestamp: latest.timestamp, title: label, status: latest.status }, historyContainer);
    div.appendChild(header);

    if (latest.message) {
        const response = createResponseParagraph(latest.message);
        div.appendChild(response);
    }
    div.appendChild(historyContainer);
    
    if (latest.status === MSG_STATUS.RESPONDED) {
        const btnContainer = createButton(stepKey);
        div.appendChild(btnContainer);
        flashElement(div);
    }
    
    historyLogBox.prepend(div);
}


const toggleMessage = (e, historyContainer, toggle)=> { 
    e.stopPropagation();
    const isOpen = historyContainer.style.display ==='block';
    historyContainer.style.display = isOpen ? 'none' : 'block';
    toggle.textContent = isOpen ? '▾' : '▴';
}

// SUBCOMPONENTS //
function createHeader({ timestamp, title, status }, historyContainer) {
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

    const requestType = formatRequestType(title);
    const step = state.steps[requestType];

    const statusIsDone = [MSG_STATUS.EXECUTED, MSG_STATUS.TIMEOUT, MSG_STATUS.CANCELLED, MSG_STATUS.CLOSED, MSG_STATUS.ERROR]
        .includes(status.toLowerCase());

    const shouldShowTimer = step?.timeLeft && !statusIsDone;

    if (state.isFiltered && shouldShowTimer) {
        const remaining = step.timeLeft ?? 90;
        const timerEl = createTimer(requestType, remaining);
        p.appendChild(timerEl);
    }

    const toggle = document.createElement('span');
    toggle.textContent = '▾';
    toggle.classList.add('toggle-arrow');
    toggle.style.marginLeft = '10px';
    p.appendChild(toggle);

    p.addEventListener("click", (e) => toggleMessage(e, historyContainer, toggle));

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
export function updateMessageStatus(requestType, newStatus) {
    const message = document.querySelector(`.new-message[data-requesttype="${requestType}"]`);
    if (!message) return;

    const statusEl = message.querySelector('.status');
    if (!statusEl) return;

    Object.values(MSG_STATUS).forEach(status => statusEl.classList.remove(status.toLowerCase()));

    statusEl.textContent = newStatus.toUpperCase();
    statusEl.classList.add(newStatus.toLowerCase());
    message.dataset.status = newStatus.toLowerCase();
}