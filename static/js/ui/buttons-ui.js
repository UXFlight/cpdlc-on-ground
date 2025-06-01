
import { loadEvent } from "../events/load.js";
import { executeEvent, cancelExecuteEvent } from "../events/execute.js";
import { actionEvent } from "../events/action.js";

// buttons functions
export function disableCancelButtons(action) {
    const cancelBtn = document.querySelector(`.cancel-button[data-action="${action}"]`);
    if (cancelBtn) cancelBtn.disabled = true;
}

export const disableAllRequestButtons = () => {
    const requestButtons = document.querySelectorAll(".request-button");
    requestButtons.forEach(btn => {
        btn.disabled = true;
        btn.classList.remove("active");
    });
}

export const enableAllRequestButtons = () => {
    const requestButtons = document.querySelectorAll(".request-button");
    requestButtons.forEach(btn => {
        btn.disabled = false;
        btn.classList.add("active");
    });
}

export function createButton(action) {
    const btnContainer = document.createElement('div');
    btnContainer.classList.add('action-buttons-grp');

    let buttons = [];

    const isTaxi = ["expected_taxi_clearance", "taxi_clearance"].includes(action);

    if (isTaxi) buttons.push(
        { label: 'LOAD', id: 'load-button', disabled: !isTaxi },
        { label: 'EXECUTE', id: 'execute-button', disabled: true },
        { label: 'CANCEL', id: 'cancel-execute-button', disabled: true }
    )

    buttons.push(
        { label: 'WILCO', id: 'wilco-button', disabled: isTaxi },
        { label: 'STANDBY', id: 'standby', disabled: isTaxi },
        { label: 'UNABLE', id: 'unable', disabled: isTaxi },
    );


    buttons.forEach(({ label, id, disabled }) => {
        btnContainer.appendChild(createActionButton(label, id, action, disabled));
    });

    return btnContainer;
}

function createActionButton(label, id = null, action, disabled = false) {
    const btn = document.createElement('button');
    btn.disabled = disabled;
    btn.classList.add('action-button');
    if (id) btn.id = id;
    btn.textContent = label.toUpperCase();
    btn.dataset.actionType = label.toLowerCase();

    btn.onclick = (e) => {
        const status = label.toLowerCase();

        console.log(`[LOG] ${label} clicked (actionType: ${status}, from: ${action})`);

        switch (status) {
            case MSG_STATUS.LOAD:
                loadEvent.call(btn, e); 
                break;
            case MSG_STATUS.EXECUTE:
                executeEvent(e);
                break;
            case MSG_STATUS.CANCEL:
                cancelExecuteEvent(e);
                break;
            case MSG_STATUS.WILCO:
            case MSG_STATUS.STANDBY:
            case MSG_STATUS.UNABLE:
                actionEvent(status, e);
                break;
            default:
                console.warn(`Unhandled action type: ${status}`);
        }
    };
    return btn;
}