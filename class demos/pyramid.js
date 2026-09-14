const prompt = require('prompt-sync')();

// Pyramid: base area A, height h
// Volume = (1/3)Ah
// Surface Area = A + (1/2) * perimeter of base * slant height
// Prompt for base area and height
let sideLength = parseFloat(prompt('Enter the side length of the square base: '));
let height = parseFloat(prompt('Enter the height of the pyramid: '));

// Calculate base area
let baseArea = Math.pow(sideLength, 2);

// Calculate volume
let volume = (1/3) * baseArea * height;

// Calculate slant height
let slantHeight = Math.sqrt(Math.pow(height, 2) + Math.pow(sideLength / 2, 2));

// Calculate perimeter of base
let perimeter = 4 * sideLength;

// Calculate surface area
let surfaceArea = baseArea + (0.5 * perimeter * slantHeight);

// Output the results
console.log(`Volume of the pyramid: ${volume.toFixed(2)} cubic units`);
console.log(`Surface Area of the pyramid: ${surfaceArea.toFixed(2)} square units`);
console.log(`Slant Height of the pyramid: ${slantHeight.toFixed(2)} units`);
