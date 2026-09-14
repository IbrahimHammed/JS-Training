const prompt = require('prompt-sync')();

// Get 2 numbers from the user
let num1 = parseInt(prompt('Enter the first number: '));
let num2 = parseInt(prompt('Enter the second number: '));

// Validate the inputs
if (isNaN(num1) || isNaN(num2)) {
    console.log('Invalid input: please enter valid numbers.');
} else {
    // Get the operator from the user
    let operator = prompt('Enter the operator (+, -, *, /, **, %): ');

    // Perform the calculation based on the operator
    let result;

    if (operator === '+') {
        result = num1 + num2;
    } else if (operator === '-') {
        result = num1 - num2;
    } else if (operator === '*') {
        result = num1 * num2;
    } else if (operator === '/') {
        if (num2 === 0) {
            console.log('Error: Division by zero is not allowed.');
            return;
        }
        result = num1 / num2;
    } else if (operator === '**') {
        result = Math.pow(num1, num2);
    } else if (operator === '%') {
        if (num2 === 0) {
            console.log('Error: Division by zero is not allowed.');
            return;
        }
        result = num1 % num2;
    } else {
        console.log('Invalid operator entered. Please enter a valid operator (+, -, *, /, **, %).');
        return;
    }

    console.log(`The result of ${num1} ${operator} ${num2} is: ${result}`);
}