// Get reference to the html elements by id
const coeffA = document.getElementById('a');
const coeffB = document.getElementById('b');
const result = document.getElementById('c');

const varX = document.getElementById('x');
const varY = document.getElementById('y');

const operator = document.getElementById('operator');
const equalTo = document.getElementById('equalTo');

const btnCalculate = document.getElementById('btnCalculate');
const btnReset = document.getElementById('btnReset');

// Define the function for maths operations
function calculate() {
    // Get the values from the input fields
    const a = parseFloat(coeffA.value);
    const b = parseFloat(coeffB.value);
    const x = parseFloat(varX.value);
    const y = parseFloat(varY.value);

    // Check if the values are valid numbers
    if (isNaN(a) || isNaN(b) || isNaN(x) || isNaN(y)) {
        result.textContent = 'Please enter valid numbers for all coefficients and variables.';
        return;
    }

    // Perform the calculation based on the selected operator
    let calculationResult;
    switch (operator.value) {
        case '+':
            calculationResult = (a * x) + (b * y); 
            break;

        case '-':
            calculationResult = (a * x) - (b * y);
            break;

        case '*':
            calculationResult = (a * x) * (b * y);
            break;

        case '/':
            if (b * y === 0) {
                result.textContent = 'Division by zero is not allowed.';
                return;
            }
            calculationResult = (a * x) / (b * y);
            break;

        case '%':
            calculationResult = (a * x) % (b * y);
            break;

        case '^':
            calculationResult = Math.pow((a * x), (b * y));
            break;

        default:
            alert('Please select a valid operator.');
            return;
    }
    
    //  Display the final result
    result.value = calculationResult;
}

// Define the reset function separately for the reset button
function resetFields() {
    coeffA.value = '';
    coeffB.value = '';
    varX.value = '';
    varY.value = '';
    operator.value = '+';
    result.textContent = '';
}

// Add event listeners to the buttons
btnCalculate.addEventListener('click', calculate);
btnReset.addEventListener('click', resetFields);