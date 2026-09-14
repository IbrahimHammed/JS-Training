const prompt = require('prompt-sync')();

// Input
// let x = prompt('Enter the first number: ');
// let y = prompt('Enter the second number: ');


// let x = Number(prompt('Enter the first number: '));
// let y = Number(prompt('Enter the second number: '));

// let x = parseInt(prompt('Enter the first number: '));
// let y = parseInt(prompt('Enter the second number: '));

let x = parseFloat(prompt('Enter the first number: '));
let y = parseFloat(prompt('Enter the second number: '));

// Pre-Processing
// x = parseInt(x);
// y = parseInt(y);

let qty = parseInt(prompt('Enter the quantity: '));
let unitPrice = parseFloat(prompt('Enter the unit price: '));

// Method-1
// x = Number(x);
// y = Number(y);

// Method-2
// x = parseFloat(x);
// y = parseFloat(y);

// Processing
let z = x + y;

// Output
console.log('The sum of x and y is ', z);
console.log(`The sum of ${x} and ${y} is ${z}`);