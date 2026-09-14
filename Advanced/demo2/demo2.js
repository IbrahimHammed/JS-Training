// This js file demostrates how to get values from both input in demo2.html and perform the maths tasks and display the result in a label

// Get references to the input fields and the result label
const num1Input = document.getElementById('num1');
const num2Input = document.getElementById('num2');
const resultLabel = document.getElementById('result');

// Get references to the operation buttons
const btnAdd = document.getElementById('btnAdd');
const btnSubtract = document.getElementById('btnSubtract');
const btnMultiply = document.getElementById('btnMultiply');
const btnDivide = document.getElementById('btnDivide');
const btnExponent = document.getElementById('btnExponent');
const btnModulus = document.getElementById('btnModulus');

// Function to perform the selected operation
function performOperation(operation) {
    const num1 = parseFloat(num1Input.value);
    const num2 = parseFloat(num2Input.value);
    let result;

    switch (operation) {
        case 'add':
            result = num1 + num2;
            break;
        case 'subtract':
            result = num1 - num2;
            break;
        case 'multiply':
            result = num1 * num2;
            break;
        case 'divide':
            if (num2 !== 0) {
                result = num1 / num2;
            } else {
                result = 'Error: Division by zero';
            }
            break;
        case 'exponent':
            result = Math.pow(num1, num2);
            break;
        case 'modulus':
            result = num1 % num2;
            break;
        default:
            result = 'Invalid operation';
    }

    // Display the result in the label
    resultLabel.textContent = `Result: ${result}`;
}

// Validate input fields to ensure they are not empty and contain valid numbers
function validateInputs() {
    const num1 = num1Input.value.trim();
    const num2 = num2Input.value.trim();

    if (num1 === '' || isNaN(num1)) {
        alert('Please enter a valid number for Number 1');
        num1Input.focus();
        return false;
    }

    if (num2 === '' || isNaN(num2)) {
        alert('Please enter a valid number for Number 2');
        num2Input.focus();
        return false;
    }

    return true;
}

// Add event listeners to the buttons
btnAdd.addEventListener('click', () => {
    if (validateInputs()) {
        performOperation('add');
    }
});

btnSubtract.addEventListener('click', () => {
    if (validateInputs()) {
        performOperation('subtract');
    }
});

btnMultiply.addEventListener('click', () => {
    if (validateInputs()) {
        performOperation('multiply');
    }
});

btnDivide.addEventListener('click', () => {
    if (validateInputs()) {
        performOperation('divide');
    }
});

btnExponent.addEventListener('click', () => {
    if (validateInputs()) {
        performOperation('exponent');
    }
});

btnModulus.addEventListener('click', () => {
    if (validateInputs()) {
        performOperation('modulus');
    }
});

