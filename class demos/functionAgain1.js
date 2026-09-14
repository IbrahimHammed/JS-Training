const prompt = require('prompt-sync')();

// Create a basic function
function displayBanner() {
    console.log("*".repeat(50));
    console.log();
    console.log("        FUNCTION DEMO IN JS        ".padStart(50));
    console.log();
    console.log("*".repeat(50));
}

function greetUser(name) {
  console.log(`Hello, ${name}! Welcome to the program.`);
}

function validateAge(age) {
    let result = false;

    if (age < 18) {
        result = false;
    } else if (age > 80) {
        result = false;
    } else {
        result = true;
    }
  
    return result;
}


//  Call the function
displayBanner();

user = prompt("What is your name? ");
greetUser(user);

age = parseInt(prompt("What is your age? "));
let returnedResult = validateAge(age);

if (returnedResult) {
    console.log("You are eligible to use this program.");
} else {
    console.log("Sorry, you are not eligible to use this program.");
}


function manipulateNumbers(num1, num2, operation) {
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
                result = "Error: Division by zero is not allowed.";
            }
            break;
        default:
            result = "Invalid operation.";
    }
    return result;
}

function displayResult(number1, number2, output) {
    console.log(`The result of ${operation}ing ${number1} and ${number2} is: ${output}`);
}

// Input
number1 = parseInt(prompt("Enter the first number: "));
number2 = parseInt(prompt("Enter the second number: "));
operation = prompt("Enter the operation (add, subtract, multiply, divide): ");

// Call the function for processing the numbers and displaying the result
let output = manipulateNumbers(number1, number2, operation);

// Display the result
displayResult(number1, number2, output);
