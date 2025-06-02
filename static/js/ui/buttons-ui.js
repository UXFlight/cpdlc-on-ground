import { handlerMap } from "../state/handlerMap.js";

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
    btn.classList.add('action-button');
    btn.textContent = label.toUpperCase();
    if (id) btn.id = id + `-${action}`;
    btn.dataset.actionType = label.toLowerCase();
    btn.disabled = disabled;

    const status = label.toLowerCase();
    const handlerFactory = handlerMap[status];
    if (handlerFactory) {
        const clickHandler = handlerFactory(btn, action);
        btn.addEventListener('click', clickHandler);
    } else {
        console.warn(`No handler defined for status: ${status}`);
    }

    return btn;
}


// enables loadButton
export function enableLoadButton(action) {
    const loadButton = document.getElementById(`load-button-${action}`);
    if (loadButton) loadButton.disabled = false;
}

// enables executeButtons
export function enableExecutionButtons(action) {
    const executeButton = document.getElementById(`execute-button-${action}`);
    const cancelExecuteButton = document.getElementById(`cancel-execute-button-${action}`);

    if (executeButton) executeButton.disabled = false;
    if (cancelExecuteButton) cancelExecuteButton.disabled = false;
}

// enables wilcoButtons
export function enableWilcoButtons(requestType) {
    const wilcoButton = document.getElementById(`wilco-button-${requestType}`);
    const standbyButton = document.getElementById(`standby-${requestType}`);
    const unableButton = document.getElementById(`unable-${requestType}`);
    if (wilcoButton) wilcoButton.disabled = false;
    if (standbyButton) standbyButton.disabled = false;
    if (unableButton) unableButton.disabled = false;
}

// enables executeButtons
export function enableExecuteButtons(requestType) {
    const executeButton = document.getElementById(`execute-button-${requestType}`);
    const cancelExecuteButton = document.getElementById(`cancel-execute-button-${requestType}`);

    if (executeButton) executeButton.disabled = false;
    if (cancelExecuteButton) cancelExecuteButton.disabled = false;
}