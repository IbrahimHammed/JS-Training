// This is a JS file to get input from demo1.html and display a customised message in the output label
// Get the input elements and output label
const firstnameInput = document.getElementById('firstname');
const lastnameInput = document.getElementById('lastname');
const ageInput = document.getElementById('age');
const outputLabel = document.getElementById('output');
const submitButton = document.getElementById('submit');
const resetButton = document.getElementById('reset');

// Function to handle the submit button click event
function handleSubmit() {
    // Get the values from the input fields
    const firstname = firstnameInput.value.trim();
    const lastname = lastnameInput.value.trim();
    const age = ageInput.value.trim();

    // Validate the inputs
    if (!firstname || !lastname || !age) {
        outputLabel.textContent = 'Please fill in all fields.';
        return;
    }

    // Create a customised message
    const message = `Hello, ${firstname} ${lastname}! You are ${age} years old.`;
    outputLabel.textContent = message;
}

// Function to handle the reset button click event
function handleReset() {
    // Clear the input fields and output label
    firstnameInput.value = '';
    lastnameInput.value = '';
    ageInput.value = '';
    outputLabel.textContent = '';
}

// Add event listeners to the buttons
submitButton.addEventListener('click', handleSubmit);
resetButton.addEventListener('click', handleReset);

