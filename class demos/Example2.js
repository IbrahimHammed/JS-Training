// npm install prompt-sync
const prompt = require('prompt-sync')();

// Prompt user for 2 numbers
let num1 = parseFloat(prompt("Enter the first number:"));
let num2 = parseFloat(prompt("Enter the second number:"));

// Perform calculations
let sum = num1 + num2;
let difference = num1 - num2;
let product = num1 * num2;
let quotient = num1 / num2;
let modulus = num1 % num2; // Remainder of division

// Output results
console.log("Sum:", sum);
console.log("Difference:", difference);
console.log("Product:", product);
console.log("Quotient:", quotient);
console.log("Modulus:", modulus);