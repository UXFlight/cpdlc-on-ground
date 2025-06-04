import { handlerMap } from "../state/handlerMap.js";

// buttons functions
export function disableCancelButtons(requestType) {
    const cancelBtn = document.querySelector(`.cancel-button[data-requesttype="${requestType}"]`);
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

export function createButton(requestType) {
    const btnContainer = document.createElement('div');
    btnContainer.classList.add('action-buttons-grp');

    let buttons = [];

    const isTaxi = ["expected_taxi_clearance", "taxi_clearance"].includes(requestType);

    if (isTaxi) buttons.push(
        { action: 'LOAD', id: 'load', disabled: !isTaxi },
        { action: 'EXECUTE', id: 'execute', disabled: true },
        { action: 'CANCEL', id: 'cancel-execute', disabled: true }
    )

    buttons.push(
        { action: 'WILCO', id: 'wilco', disabled: isTaxi },
        { action: 'STANDBY', id: 'standby', disabled: isTaxi },
        { action: 'UNABLE', id: 'unable', disabled: isTaxi },
    );


    buttons.forEach(({ action, id, disabled }) => {
        btnContainer.appendChild(createActionButton(requestType, action, id, disabled));
    });

    return btnContainer;
}

function createActionButton(requestType, action, id = null, disabled = false) {
    const btn = document.createElement('button');
    btn.classList.add('action-button');
    btn.textContent = action.toUpperCase();
    if (id) btn.id = id + `-${requestType}`;
    btn.dataset.actionType = action.toLowerCase();
    btn.disabled = disabled;

    const status = action.toLowerCase();
    const handlerFactory = handlerMap[status];
    if (handlerFactory) btn.addEventListener('click', handlerFactory(btn, requestType));
    return btn;
}

// enables loadButton
export function enableLoadButton(requestType) {
    const loadButton = document.getElementById(`load-button-${requestType}`);
    if (loadButton) loadButton.disabled = false;
}

// enables wilcoButtons
export function enableWilcoButtons(requestType) {
    const wilcoButton = document.getElementById(`wilco-${requestType}`);
    const standbyButton = document.getElementById(`standby-${requestType}`);
    const unableButton = document.getElementById(`unable-${requestType}`);
    if (wilcoButton) wilcoButton.disabled = false;
    if (standbyButton) standbyButton.disabled = false;
    if (unableButton) unableButton.disabled = false;
}

// enables executeButtons
export function setExecuteButtonState(isDisabled = false) {
    const executeButton = document.getElementById('execute-taxi_clearance');
    const cancelExecuteButton = document.getElementById('cancel-execute-taxi_clearance');

    if (executeButton) executeButton.disabled = isDisabled;
    if (cancelExecuteButton) cancelExecuteButton.disabled = isDisabled;
}