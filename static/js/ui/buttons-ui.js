import { actionEvent } from "../events/action.js";
import { WORKFLOW_BUTTONS } from "../utils/consts/buttonsWorkflow.js";
import { ALL_ACTIONS, LOADABLE_REQUEST_TYPES, REQUEST_TYPE } from "../utils/consts/flightConsts.js";
import { MSG_STATUS } from "../utils/consts/status.js";

// enabling btns based on action and requestType
export function enableButtonsByAction(action, requestType) {
    switch (action) {
        case MSG_STATUS.LOAD:
            if (requestType === "taxi_clearance") return setExecuteButtonState() // enables exec & cancel exec btn
            enableWilcoButtons(requestType);
            break;
        case MSG_STATUS.EXECUTE: 
            enableLoadButton(requestType)
            enableWilcoButtons(requestType) // enables wilco, standby, unable 
            break;
        case MSG_STATUS.CANCEL:
            setExecuteButtonState(true);
            enableRequestButton(requestType);
            break;
        case MSG_STATUS.UNABLE:
            enableRequestButton(requestType);
        default:
            break;
    }
}

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
    if (btn.id === "pushback-btn") return; //! skip pushback, direction buttons will handle it
        btn.disabled = false;
        btn.classList.add("active");
    });
};

export function createButton(requestType, status) {
    const btnContainer = document.createElement('div');
    btnContainer.classList.add('action-buttons-grp');

    const available = WORKFLOW_BUTTONS[requestType]?.[status]
                    || WORKFLOW_BUTTONS.default.NEW;

    const actionsToShow = !LOADABLE_REQUEST_TYPES.includes(requestType)

    ? Object.entries(ALL_ACTIONS) 
            .filter(([action]) => ['WILCO', 'STANDBY', 'UNABLE'].includes(action)) 
    : Object.entries(ALL_ACTIONS)
    for (const [action, { id }] of actionsToShow) {
        const disabled = !available.includes(action);
        const btn = createActionButton(requestType, action, id, disabled);
        btnContainer.appendChild(btn);
    }

    return btnContainer;
}

function createActionButton(requestType, action, id = null, disabled = false) {
    const btn = document.createElement('button');
    btn.classList.add('action-button');
    btn.textContent = action.toUpperCase();
    if (id) btn.id = id + `-${requestType}`;
    btn.dataset.actionType = action.toLowerCase();
    btn.disabled = disabled;
    btn.addEventListener('click', (e) => actionEvent(e));
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

// enables request button
export function enableRequestButton(requestType) {
    const requestButton = document.getElementById(`${requestType}-btn`);

    if (!requestButton) return;
    if (requestType !== REQUEST_TYPE.PUSHBACK) return requestButton.disabled = false;

    const directionButtons = document.querySelectorAll(`.direction-button`);
    directionButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.disabled = false
    });
}