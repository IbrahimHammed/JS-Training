const prompt = require('prompt-sync')();

function displayBanner() {
    console.log("*".repeat(100));
    console.log(" ".repeat(40) + "Welcome to the Function Demo App!");
    console.log("*".repeat(100));
    console.log();
}

function displayMenu() {
    console.log("Please select an option:");
    console.log();
    console.log("1. Add 2 numbers");
    console.log("2. Multiply 2 numbers");
    console.log("3. Raise x to the power of y");
    console.log("4. Area of a circle");
    console.log("5. Exit");
    console.log();
}

function addNumbers(num1, num2) {
    result =  num1 + num2;
    return result;
}

function multiplyNumbers(num1, num2) {
    result = num1 * num2;
    return result;
}

function raiseToPower(base, exponent) {
    result = Math.pow(base, exponent);
    return result;
}

function calculateCircleArea(radius) {
    result = Math.PI * radius * radius;
    return result;
}

function exitApp() {
    console.log("Thank you for using Function Demo App. Goodbye!");
    process.exit(0);
}

function task1() {
    console.log("You chose to add 2 numbers.");
    console.log();
    
    // prompt user for 2 numbers
    let num1 = parseFloat(prompt("Enter the first number: "));
    let num2 = parseFloat(prompt("Enter the second number: "));
    console.log();

    // Adds the numbers
    let sum = addNumbers(num1, num2);

    // Display the result
    console.log(`The sum of ${num1} and ${num2} is: ${sum}`);
    console.log();
}

function task2() {
    console.log("You chose to multiply 2 numbers.");
    console.log();

    // prompt user for 2 numbers
    let num1 = parseFloat(prompt("Enter the first number: "));
    let num2 = parseFloat(prompt("Enter the second number: "));
    console.log();

    // Multiplies the numbers
    let product = multiplyNumbers(num1, num2);

    // Display the result
    console.log(`The product of ${num1} and ${num2} is: ${product}`);
    console.log();
}

function task3() {
    console.log("You chose to raise x to the power of y.");
    console.log();

    // prompt user for base and exponent
    let base = parseFloat(prompt("Enter the base: "));
    let exponent = parseFloat(prompt("Enter the exponent: "));
    console.log();

    // Raise to power
    let power = raiseToPower(base, exponent);

    // Display the result
    console.log(`The result of ${base} raised to the power of ${exponent} is: ${power}`);
    console.log();
}

function task4() {
    console.log("You chose to calculate the area of a circle.");
    console.log();

    // prompt user for radius
    let radius = parseFloat(prompt("Enter the radius of the circle: "));
    console.log();

    // Calculate circle area
    let area = calculateCircleArea(radius);

    // Display the result
    console.log(`The area of the circle with radius ${radius} is: ${area}`);
    console.log();
}

function main() {
    // Display banner when the program starts
    displayBanner();

    // Loop to display menu and process user choices until they choose to exit
    while (true) {
        displayMenu();

        // Get user choice and process accordingly
        const choice = prompt("Enter your choice (1, 2, 3, 4, or 5): ");
        console.log();

        if (choice === '1') {
            task1();
        } else if (choice === '2') {
            task2();
        } else if (choice === '3') {
            task3();
        } else if (choice === '4') {
            task4();
        } else if (choice === '5') {
            exitApp();
        } else {
            console.log("Invalid choice. Please enter 1, 2, 3, 4, or 5.");
            console.log();
        }
    }
}

main();
