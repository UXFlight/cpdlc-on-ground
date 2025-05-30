import { closeCurrentOverlay } from "../utils/utils.js";

// buttons functions
export function enableButtons(action) { // we only enable load button on taxi_clearances
    switch (action) {
        case 'expected_taxi_clearance':
        enableLoadBtn()
        break;
        case 'taxi_clearance':
        enableLoadBtn();
        break;
        default:
        enableActionButtons('wilco');
        break;
    }
}

export function disableExecuteButtons() {
    document.getElementById('execute-button').disabled = true;
    document.getElementById('cancel-execute-button').disabled = true;
}

// enables buttons based on action
// action = load : enables first row
// action = wilco : enables second row
export function enableActionButtons(action) {
    const buttons = document.querySelectorAll(`.${action}-grp`);
    buttons.forEach(button => {
        button.disabled = false;
        button.classList.add("active");
    });
}

export function disableActionButtons(action) {
    const buttons = document.querySelectorAll(`.${action}-grp`);
    buttons.forEach(button => {
        button.disabled = true;
        button.classList.remove("active");
    });
}

// disable request/ cancel buttons
export function disableAllButtons(action) {
    const overlay = document.querySelector(`.overlay[data-action="${action}"]`);
    if (overlay) overlay.style.cursor = 'not-allowed';
    disableRequestButtons(action);
    disableCancelButtons(action);
    closeCurrentOverlay();
}
  
export function disableCancelButtons(action) {
    const cancelBtn = document.querySelector(`.cancel-button[data-action="${action}"]`);
    if (cancelBtn) cancelBtn.disabled = true;
}

function disableRequestButtons(action) {
    const requestBtn = document.getElementById(`${action.replace(/_/g, "-")}-btn`);
    if (requestBtn) requestBtn.disabled = true;
}

// enables load btn
function enableLoadBtn() {
    const loadButton = document.getElementById('load-button');
    if (loadButton) {
        loadButton.disabled = false;
        loadButton.classList.add('active');
    }
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