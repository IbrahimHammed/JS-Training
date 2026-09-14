const prompt = require('prompt-sync')();

function addNumbers(num1, num2) {
    return num1 + num2;
}

const addNumbers = function(num1, num2) {
    return num1 + num2;
}

const addNumbers = (num1, num2) => {
    return num1 + num2;
}

// Input from the user
let num1 = parseInt(prompt("Enter the first number: "));
let num2 = parseInt(prompt("Enter the second number: "));

// Process
let output = addNumbers(num1, num2);

// Output
console.log(`The sum of ${num1} and ${num2} is: ${output}`);

