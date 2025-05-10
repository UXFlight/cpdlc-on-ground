document.addEventListener("DOMContentLoaded", function() {
    // Call disableExecuteButtons at the start to ensure any buttons are disabled initially
    disableExecuteButtons();
    // Get all dropdown buttons
    const dropdownButtons = document.querySelectorAll(".dropdown-button");

    dropdownButtons.forEach(button => {
        // Get the corresponding dropdown content for each button
        const dropdownContent = button.nextElementSibling;

        // Special condition for the Pushback button
        if (button.textContent.trim() === "Pushback") {
            let isPushbackDropdownOpen = false; // Track if Pushback dropdown is open

            // Toggle the Pushback dropdown visibility on button click
            button.addEventListener("click", function(event) {
                // Prevent event propagation so clicking the button itself doesn't trigger the document click handler
                event.stopPropagation();

                // Toggle the Pushback dropdown's visibility
                if (isPushbackDropdownOpen) {
                    dropdownContent.style.display = "none"; // Close if already open
                    isPushbackDropdownOpen = false;
                } else {
                    dropdownContent.style.display = "block"; // Show if closed
                    isPushbackDropdownOpen = true;
                }
            });

            // Close the Pushback dropdown when 'Wilco' button is clicked inside the dropdown
            const wilcoButton = dropdownContent.querySelector(".wilco-button");
            if (wilcoButton) {
                wilcoButton.addEventListener("click", function() {
                    dropdownContent.style.display = "none"; // Close the dropdown
                    isPushbackDropdownOpen = false; // Reset state
                });
            }
        } else {
            // For all other dropdown buttons
            button.addEventListener("click", function(event) {
                // Prevent event propagation so clicking the button itself doesn't trigger the document click handler
                event.stopPropagation();

                // Close all other dropdowns
                document.querySelectorAll(".dropdown-content").forEach(content => {
                    if (content !== dropdownContent) {
                        content.style.display = "none"; // Close other dropdowns
                    }
                });

                // Toggle the current dropdown for other buttons
                if (dropdownContent.style.display === "block") {
                    dropdownContent.style.display = "none"; // Hide this dropdown if it's open
                } else {
                    dropdownContent.style.display = "block"; // Show this dropdown if it's closed
                }
            });

            // Prevent dropdown from closing when any button inside the dropdown (like "Load") is clicked
            const otherButtons = dropdownContent.querySelectorAll("button");
            otherButtons.forEach(otherButton => {
                otherButton.addEventListener("click", function(event) {
                    // Prevent the dropdown from closing when any button inside the dropdown is clicked
                    event.stopPropagation();
                });
            });

            // Close the dropdown when 'Wilco' button is clicked inside the dropdown
            const wilcoButton = dropdownContent.querySelector(".wilco-button");
            if (wilcoButton) {
                wilcoButton.addEventListener("click", function() {
                    dropdownContent.style.display = "none"; // Close the dropdown
                });
            }

            // Handle Request button click inside dropdowns
            const requestButton = dropdownContent.querySelector(".request-button");
            if (requestButton) {
                requestButton.addEventListener("click", function(event) {
                    // Change the style of the Request button
                    requestButton.style.color = "green"; // Text color to green
                    requestButton.style.backgroundColor = "black"; // Background to black

                    // Optionally prevent closing of dropdown until Wilco is clicked
                    event.stopPropagation(); // Prevent event from propagating to document
                });
            }

            // Special case for Expected Taxi Clearance dropdown
            if (button.textContent.trim() === "Expected Taxi Clearance") {
                const wilcoButton = dropdownContent.querySelector(".wilco-button");
                if (wilcoButton) {
                    wilcoButton.addEventListener("click", function() {
                        dropdownContent.style.display = "none"; // Close the dropdown only when Wilco is clicked
                    });
                }
            }
        }
    });

    // Close all dropdowns if clicked outside, except for the active dropdowns
    document.addEventListener("click", function(event) {
        document.querySelectorAll(".dropdown-content").forEach(content => {
            // Close dropdowns if the click is outside the dropdown button
            if (!content.contains(event.target) && !content.previousElementSibling.contains(event.target)) {
                content.style.display = "none"; // Close the dropdown
            }
        });
    });
});

let currentDropdownIndex = 0;
const dropdowns = [
    { id: "expected-taxi-clearance", tickId: "expected-taxi-clearance-tick" },
    { id: "engine-startup", tickId: "engine-startup-tick-icon" },
    { id: "pushback", tickId: "pushback-spinner-tick-icon" },
    { id: "taxi-clearance", tickId: "taxi-clearance-tick-icon" },
    { id: "de-icing", tickId: "de-icing-tick-icon" }
];

let previous_entry = null;

// Function to add a tick mark to a button
function addTickMarkToButton(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        // Check if the tick mark is already added to avoid multiple ticks
        if (!button.innerHTML.includes('✓')) {
            button.innerHTML = `✓ ${button.innerHTML}`; // Add tick mark to the button text
            button.disabled = false; // Disable button after action is processed
        }
    } else {
        console.error(`Button with ID "${buttonId}" not found.`);
    }
}

// Function to hide the spinner and show the tick mark after the action is completed
function completeProcess(dropdownId, tickId) {
    // Hide the spinner for the specific dropdown
    const spinner = document.getElementById(dropdownId + "-spinner");
    if (spinner) {
        spinner.style.display = "none";  // Hide spinner
    }

    // Show the tick mark for the specific dropdown
    const tickIcon = document.getElementById(tickId);
    if (tickIcon) {
        tickIcon.style.display = "inline";  // Show tick
    }
}

function handleButtonClick(buttonType, dropdownId, tickId) {
    console.log(`${buttonType} button clicked: Sending a request to server...`);

    // Create the body data dynamically based on the button type
    const requestData = {
        requestType: `${buttonType}TaxiClearance`
    };

    // Send the POST request to the server
    fetch('/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error(data.error);
            alert(`Error: ${data.error}`);
        } else {
            console.log("Response from server:", data.message);

            // After a successful response, show the tick mark and hide the dropdown
            const dropdown = document.getElementById(dropdownId);
            const tickIcon = document.getElementById(tickId);

            dropdown.style.display = 'none';  // Hide the dropdown
            tickIcon.style.display = 'inline';  // Show the tick mark

            // Update the clearance message or perform additional actions if needed
            const clearanceBox = document.getElementById('taxi-clearance-message');
            clearanceBox.innerHTML = `<p>TAXI VIA C, C1, B, B1. HOLDSHORT RWY 24R</p>`;

            // Optionally disable further interactions with Wilco buttons
            //disableWilcoButtons();

            // Prevent any further updates to the clearance message
            preventMessageUpdate();

            // Optionally enable/disable action buttons (Wilco, Standby, Unable)
            enableWilcoButtons();  // Re-enable buttons if needed
        }
    })
    .catch(error => {
        console.error('Error communicating with server:', error);
        alert('Error communicating with server.');
    });
}

// Function to handle the Load button click
function handleLoadButtonClick() {
    console.log("Load button clicked: Sending a request to load taxi clearance...");
    fetch('/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: previous_entry })  // Sending previous entry in the body
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error(data.error);
            //alert(`Error: ${data.error}`);
        }
        else if(data.message === null) {
            return;
        }
        else {
            console.log("Response from server:", data.message);
            const clearanceBox = document.getElementById('taxi-clearance-message');
            // Display the fixed message after load

            clearanceBox.innerHTML = `<p>${data.message}</p>`;

            // Disable buttons to prevent further changes after loading
            //disableWilcoButtons();

            // Prevent any further updates to the clearance message
            preventMessageUpdate();
            
            // Enable action buttons (Wilco, Standby, Unable) after Load
            enableWilcoButtons();  // This enables action buttons

            // Add tick mark to Expected Taxi Clearance button after Load
            //addTickMarkToButton('expected-taxi-clearance-request');
        }
    })
    .catch(error => {
        console.error('Error loading taxi clearance:', error);
        alert('Error communicating with server.');
    });
}

// Function to handle the action button click (Wilco, Standby, Unable)
function handleActionButtonClick(action) {
    console.log(`Action button clicked: ${action}`);

    // Ensure there are dropdowns to process
    if (currentDropdownIndex < dropdowns.length) {
        // Get the current dropdown and associated elements
        const dropdown = dropdowns[currentDropdownIndex];
        const dropdownButton = document.getElementById(dropdown.id);
        const tickIcon = document.getElementById(dropdown.tickId);
        const loadButton = document.getElementById(dropdown.id + '-request');
        const spinner = document.getElementById(dropdown.id + "-spinner"); // Spinner element

        // Show loader (optional: you can use this to indicate loading)
        if (loadButton) loadButton.innerText = 'Loading...';

        // Send POST request to the server
        fetch(`/action/${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: action })  // Sending action type in the body
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error(data.error);
                alert(`Error: ${data.error}`);
            } else {
                console.log(`Action ${action} processed successfully.`);
                //alert(data.message);

                // Hide the 'Load' button for the current dropdown
                if (loadButton) loadButton.style.display = 'none';

                // Hide the spinner smoothly before showing the tick
                if (spinner) {
                    spinner.style.opacity = '0';  // Fade out the spinner
                    setTimeout(() => {
                        spinner.style.display = 'none'; // Hide the spinner after fading out
                    }, 300); // Match the duration with transition time
                }

/*                 // Display the tick mark for the current dropdown
                if (tickIcon) {
                    tickIcon.style.opacity = '0';  // Start with tick hidden
                    tickIcon.style.display = 'inline'; // Show tick
                    setTimeout(() => {
                        tickIcon.style.opacity = '1';  // Fade in the tick icon
                    }, 10);  // Small delay before tick appears
                }

                // Move to the next dropdown
                currentDropdownIndex++; */

                // If there are more dropdowns, show the next "Load" button
                if (currentDropdownIndex < dropdowns.length) {
                    const nextDropdown = dropdowns[currentDropdownIndex];
                    const nextLoadButton = document.getElementById(nextDropdown.id + '-request');
                    if (nextLoadButton) nextLoadButton.style.display = 'inline';
                }

                // Handle Execute and Cancel buttons for Taxi Clearance ONLY
                const previousDropdown = dropdowns[currentDropdownIndex - 1];
                if (previousDropdown && previousDropdown.id === "taxi-clearance") {
                    console.log("Enabling Execute and Cancel for Taxi Clearance...");
                    enableExecuteButton(); // Enable Execute and Cancel buttons
                } else {
                    console.log("Disabling Execute and Cancel for other menus...");
                    disableExecuteButtons(); // Always disable for others
                }
            }
        })
        .catch(error => {
            console.error('Error sending action request:', error);
            alert('Error communicating with server.');
        })
        .finally(() => {
            // Reset the 'Load' button text if needed
            if (loadButton) loadButton.innerText = 'Load';
        });
    } else {
        console.log("No more dropdowns to process.");
    }
}

let previous_exp = null;
let previous_clearance = null;

// Function for sending request actions (e.g., Expected Taxi Clearance, Engine Startup)
function sendRequest(action, dropdownId, tickId) {
    if(action === "taxi_clearance") {
        console.log("Taxi Clearance button clicked: Sending a request to server...");
    }
    console.log(`Sending request for action: ${action}`);
    fetch(`/request/${action}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error(data.error);
        }
        if(action === "expected_taxi_clearance") {
            setTimeout(() => sendRequest('expected_taxi_clearance', dropdownId, tickId), 3000);
        }
        else if(action === "taxi_clearance")
        {
            setTimeout(() => sendRequest('taxi_clearance', dropdownId, tickId), 3000);
        }
        if (action != "expected_taxi_clearance" && action != "taxi_clearance" ||
            action === "expected_taxi_clearance" && data.message != previous_exp  && data.message != null ||
            action === "taxi_clearance" && data.message != previous_clearance && data.message != null) {
            const messageBox = document.getElementById('message-box');
            const newMessage = document.createElement('div');
            newMessage.innerHTML = `
                <p>
                    <span class="timestamp">${data.timestamp}</span> |
                    <span class="message-title">${data.action}</span>
                    <span class="status open">OPEN</span>
                </p>
                <p>${data.message}</p>
            `;
            newMessage.classList.add('new-message');
            messageBox.insertBefore(newMessage, messageBox.firstChild);

            // Mark all older messages as old
            markOldMessages(messageBox);

            // Update taxi clearance if applicable
            if (action === "expected_taxi_clearance") {
                updateTaxiClearance(data.message, "open");
                previous_exp = data.message;
            }
            if(action === "taxi_clearance") {
                updateTaxiClearance(data.message, "open");
                previous_clearance = data.message;
            }
            messageBox.scrollTop = messageBox.scrollHeight;
            previous_entry = action;
        }
    })
    .catch(error => {
        console.error('Error sending request:', error);
        alert('Error communicating with server.');
    });
    // Add tick mark to Expected Taxi Clearance button after sending the request
    completeProcess(dropdownId, tickId);
}

// Helper function to mark all older messages as old
function markOldMessages(messageBox) {
    const messages = messageBox.querySelectorAll('.new-message');

    messages.forEach((message, index) => {
        if (index !== 0) { // Exclude the latest message
            const statusElement = message.querySelector('.status');
            if (statusElement) {
                statusElement.textContent = 'CLOSED';
                statusElement.classList.remove('open');
                statusElement.classList.add('closed');
            }
            message.classList.add('old-message'); // Add a class for older messages
        }
    });
}

// Function to prevent any updates to taxi clearance once load has been clicked
function preventMessageUpdate() {
    const messageBox = document.getElementById('message-box');
    messageBox.classList.add("message-locked");
}

// Function to update taxi clearance message
function updateTaxiClearance(message, status) {
    const clearanceBox = document.getElementById("taxi-clearance-message");

    if (status === "open" || status === "loaded") {
        /*clearanceBox.innerHTML = `<p>${message}</p>`;*/
    }
    if (status === "loaded") {
        enableWilcoButtons(); // Make sure buttons are enabled after update
    }
}

// Function to enable Wilco, Standby, and Unable buttons
function enableWilcoButtons() {
    console.log("Enabling Wilco, Standby, and Unable buttons...");
    const buttons = document.querySelectorAll(".action-button");
    buttons.forEach(button => {
        button.disabled = false;
        button.classList.add("active");
    });
}

// Function to disable Wilco, Standby, and Unable buttons
function disableWilcoButtons() {
    console.log("Disabling Wilco, Standby, and Unable buttons...");
    const buttons = document.querySelectorAll(".action-button");
    buttons.forEach(button => {
        button.disabled = true;
        button.classList.remove("active");
    });
}

// Function to activate action buttons (general utility)
function activateActionButtons() {
    const buttons = document.querySelectorAll(".action-button");
    buttons.forEach(button => {
        button.disabled = false;
        button.classList.add("active");
    });
}

// Pushback Functionality Starts Here

let selectedPushbackDirection = null; // Store the selected direction (Left or Right)

// Function to handle selecting a direction (Left/Right)
function selectPushbackDirection(direction) {
    selectedPushbackDirection = direction;

    const leftButton = document.getElementById('pushback-left');
    const rightButton = document.getElementById('pushback-right');
    if (direction === 'left') {
        leftButton.classList.add('active');
        rightButton.classList.remove('active');
    } else {
        rightButton.classList.add('active');
        leftButton.classList.remove('active');
    }

    const requestButton = document.getElementById('pushback-request');
    requestButton.disabled = false;
    requestButton.classList.add('active');
}

// Function to send the Pushback request using sendRequest
function sendPushbackRequest() {
    if (!selectedPushbackDirection) {
        alert('Please select a direction (Left or Right) before requesting.');
        return;
    }

    const timestamp = new Date().toLocaleTimeString(); // Generate a current timestamp
    const pushbackMessage = `PUSHBACK TO ${selectedPushbackDirection.toUpperCase()} APPROVED`;

    const data = {
        action: 'PUSHBACK',
        message: pushbackMessage,
        timestamp: timestamp
    };

    const messageBox = document.getElementById('message-box');
    const newMessage = document.createElement('div');
    newMessage.innerHTML = `
        <p>
            <span class="timestamp">${data.timestamp}</span> | 
            <span class="message-title">${data.action}</span>
            <span class="status open">OPEN</span>
        </p>
        <p>${data.message}</p>
    `;
    newMessage.classList.add('new-message');
    messageBox.insertBefore(newMessage, messageBox.firstChild);

    // Mark all older messages as old
    markOldMessages(messageBox);
    messageBox.scrollTop = messageBox.scrollHeight;
}

// Function to reset the Pushback dropdown
function resetPushback() {
    selectedPushbackDirection = null;

    const leftButton = document.getElementById('pushback-left');
    const rightButton = document.getElementById('pushback-right');
    const requestButton = document.getElementById('pushback-request');

    leftButton.classList.remove('active');
    rightButton.classList.remove('active');
    requestButton.disabled = true;
    requestButton.classList.remove('active');
}

// Function to reset Expected Taxi Clearance
function resetExpectedTaxiClearance() {
    const clearanceBox = document.getElementById('taxi-clearance-message');
    clearanceBox.innerHTML = '';  // Clear the clearance message

    const requestButton = document.getElementById('expected-taxi-clearance-request');
    requestButton.disabled = true;
    requestButton.classList.remove('active'); // Disable request button

    // Optionally, you can reset any other UI element that interacts with this action
    console.log("Expected Taxi Clearance reset.");
}

// Function to reset Engine Startup
function resetEngineStartup() {
    const clearanceBox = document.getElementById('engine-startup-message');
    clearanceBox.innerHTML = '';  // Clear the engine startup message

    const requestButton = document.getElementById('engine-startup-request');
    requestButton.disabled = true;
    requestButton.classList.remove('active'); // Disable request button

    // Optionally, you can reset any other UI element that interacts with this action
    console.log("Engine Startup reset.");
}

// Function to reset Taxi Clearance
function resetTaxiClearance() {
    const clearanceBox = document.getElementById('taxi-clearance-message');
    clearanceBox.innerHTML = '';  // Clear the taxi clearance message

    const requestButton = document.getElementById('taxi-clearance-request');
    requestButton.disabled = true;
    requestButton.classList.remove('active'); // Disable request button

    // Optionally, you can reset any other UI element that interacts with this action
    console.log("Taxi Clearance reset.");
}

// Function to reset De-Icing
function resetDeIcing() {
    const clearanceBox = document.getElementById('de-icing-message');
    clearanceBox.innerHTML = '';  // Clear the de-icing message

    const requestButton = document.getElementById('de-icing-request');
    requestButton.disabled = true;
    requestButton.classList.remove('active'); // Disable request button

    // Optionally, you can reset any other UI element that interacts with this action
    console.log("De-Icing reset.");
}

// Enable Execute Button after Wilco
function enableExecuteButton() {
    document.getElementById('execute-button').disabled = false;
    document.getElementById('cancel-execute-button').disabled = false;
}

// Handle Execute Button Click
function handleExecuteButtonClick() {
    console.log("Execute button clicked: Sending a POST request...");

    // Send POST request to the server
    fetch('/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: 'executeTaxiClearance' }) // Update the requestType if needed
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error(data.error);
            alert(`Error: ${data.error}`);
        } else {
            console.log("Response from server:", data.message);

            // Add a success message or update the UI as needed
            const clearanceBox = document.getElementById('taxi-clearance-message');
            clearanceBox.innerHTML = `<p>${data.message}</p>`; // Display the response message
            
            // Add a tick mark to the Execute button
            addTickMarkToButton('execute-button');
            
            // Optionally disable the Execute button after a successful action
            document.getElementById('execute-button').disabled = true;
        }
    })
    .catch(error => {
        console.error('Error executing taxi clearance:', error);
        alert('Error communicating with server.');
    });
}

// Disable Execute and Cancel Buttons
function disableExecuteButtons() {
    document.getElementById('execute-button').disabled = true;
    document.getElementById('cancel-execute-button').disabled = true;
}

// Handle Cancel Execute Button Click
function handleCancelExecuteButtonClick() {
    console.log("Cancel Execute button clicked.");
    disableExecuteButtons(); // Simply disable the buttons for now
}