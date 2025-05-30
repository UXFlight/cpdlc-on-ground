import { ensureMessageBoxNotEmpty } from "../ui/ui.js";

export function createActiveLogs({ action, timestamp, status, message }) {
    const activeLogBox = document.getElementById('active-log-box');
    ensureMessageBoxNotEmpty('active-log-box');
    if (!activeLogBox) return console.warn('Missing #active-log-box');

    const div = document.createElement('div');
    div.classList.add('active-message');
    div.dataset.action = action.toLowerCase();
    div.dataset.status = status.toLowerCase();

    // Header
    const header = document.createElement('p');

    const ts = document.createElement('span');
    ts.classList.add('timestamp');
    ts.textContent = timestamp;

    const title = document.createElement('span');
    title.classList.add('message-title');
    title.textContent = action;

    const statusEl = document.createElement('span');
    statusEl.classList.add('status', status.toLowerCase());
    statusEl.textContent = status.toUpperCase();

    header.append(ts, title, document.createTextNode(' '), statusEl);
    div.appendChild(header);

    // Message
    if (message) {
        const p = document.createElement('p');
        p.classList.add('message-response');
        p.textContent = message;
        div.appendChild(p);
    }

    // Buttons container
    const btnContainer = document.createElement('div');
    btnContainer.classList.add('action-buttons-grp'); // ✅ style existant

    // Buttons selon le type de message
    if (["expected_taxi_clearance", "taxi_clearance"].includes(action)) {
        btnContainer.appendChild(createActionButton('LOAD', 'load-button'));
        btnContainer.appendChild(createActionButton('EXECUTE', 'execute-button'));
        btnContainer.appendChild(createActionButton('CANCEL', 'cancel-execute-button'));
    } else {
        btnContainer.appendChild(createActionButton('WILCO'));
        btnContainer.appendChild(createActionButton('STANDBY', 'standby'));
        btnContainer.appendChild(createActionButton('UNABLE', 'unable'));
    }

    div.appendChild(btnContainer);
    activeLogBox.prepend(div);
}

function createActionButton(label, id = null) {
    const btn = document.createElement('button');
    btn.classList.add('action-button');
    if (id) btn.id = id;
    btn.textContent = label;
    btn.dataset.actionType = label.toLowerCase();

    btn.onclick = () => {
        console.log(`[UI] ${label} clicked (actionType: ${btn.dataset.actionType})`);
    };

    return btn;
}
