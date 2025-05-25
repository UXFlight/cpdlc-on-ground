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
    disableRequestButtons(action);
    disableCancelButtons(action); 
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