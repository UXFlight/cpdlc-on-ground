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