const prompt = require('prompt-sync')();

// Define a function to get number1 and validate it
function getNumber1() {
    let num1;
    while (true) {
        num1 = parseFloat(prompt("Enter the first number: "));
        if (!isNaN(num1)) break;
        console.log("Invalid input. Please enter a valid number.");
    }
    return num1;
}

// Define a function to get number2 and validate it
function getNumber2() {
    let num2;
    while (true) {
        num2 = parseFloat(prompt("Enter the second number: "));
        if (!isNaN(num2)) break;
        console.log("Invalid input. Please enter a valid number.");
    }
    return num2;
}

// Define a function to add 2 numbers
function addNumbers(num1, num2) {
    return num1 + num2;
}

// Define a function to multiply 2 numbers
function multiplyNumbers(num1, num2) {
    return num1 * num2;
}

// Define a function to raise x to the power of y
function raiseToPower(base, exponent) {
    return Math.pow(base, exponent);
}

// Propmt user for task choice and validate it
function getTaskChoice() {
    let choice;
    while (true) {
        console.log("Choose a task:");
        console.log("1. Add 2 numbers");
        console.log("2. Multiply 2 numbers");
        console.log("3. Raise x to the power of y");
        console.log("4. Calculate the area of a circle");

        choice = parseInt(prompt("Enter your choice (1-4): "));

        if ([1, 2, 3, 4].includes(choice)) break;

        console.log("Invalid choice. Please enter a number between 1 and 4.");
    }
    return choice;
}

// Main function to execute the selected task
function main() {
    const choice = getTaskChoice();

    switch (choice) {
        case 1:
            const num1 = getNumber1();
            const num2 = getNumber2();
            const sum = addNumbers(num1, num2);
            console.log(`The sum of ${num1} and ${num2} is: ${sum}`);
            break;

        case 2:
            const num3 = getNumber1();
            const num4 = getNumber2();
            const product = multiplyNumbers(num3, num4);
            console.log(`The product of ${num3} and ${num4} is: ${product}`);
            break;
        case 3:
            const base = getNumber1();
            const exponent = getNumber2();
            const power = raiseToPower(base, exponent);
            console.log(`${base} raised to the power of ${exponent} is: ${power}`);
            break;
        case 4:
            const radius = getNumber1();
            const area = calculateCircleArea(radius);
            console.log(`The area of the circle with radius ${radius} is: ${area}`);
            break;
    }
}

// Define a function to calculate the area of a circle
function calculateCircleArea(radius) {
    return Math.PI * Math.pow(radius, 2);
}

// Run the main function
main();
