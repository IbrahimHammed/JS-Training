const prompt = require('prompt-sync')();

let number1 = prompt('Enter the first number: ');
number1 = parseInt(number1);

// Power calculation
let index = prompt('Enter the index for the power calculation: ');
index = parseInt(index);

let power = Math.pow(number1, index);

console.log(`The power of ${number1} to ${index} is: ${power}`);

// sqrt calculation
let sqrt = Math.sqrt(number1);
console.log(`The square root of ${number1} is: ${sqrt}`);

let maxNum = Math.max(10, 20, 30, 40, 50);
let minNum = Math.min(10, 20, 30, 40, 50);
console.log(`The maximum number is: ${maxNum}`);
console.log(`The minimum number is: ${minNum}`);