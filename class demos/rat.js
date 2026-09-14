const prompt = require('prompt-sync')();

//  get base and height from user
let base = parseFloat(prompt('Enter the base of the triangle: '));
let height = parseFloat(prompt('Enter the height of the triangle: '));


// Calculate hypotenuse and area
let hypotenuse = Math.hypot(base, height);

console.log(`The hypotenuse of a RAT of base ${base} and height ${height} is: ${hypotenuse}`);
