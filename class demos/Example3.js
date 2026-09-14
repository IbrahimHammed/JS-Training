// Get the lenth, breadth of a rectangle and calculate the area and perimeter of the rectangle. Display the output in the console.

const prompt = require('prompt-sync')();

// Prompt user for length and breadth
let length = prompt("Enter the length of the rectangle:");
let breadth = prompt("Enter the breadth of the rectangle:");

// Calculate area and perimeter
let area = parseInt(length) * parseInt(breadth);
let perimeter = 2 * (parseInt(length) + parseInt(breadth));

// Output results
console.log("Area of the rectangle:", area);
console.log("Perimeter of the rectangle:", perimeter);
