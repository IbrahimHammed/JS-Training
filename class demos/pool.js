const prompt = require('prompt-sync')();

// Swimming Pool: length l, width w, depth d
// Prompt for length, width, and depth
let length = parseFloat(prompt('Enter the length of the pool: '));
let width = parseFloat(prompt('Enter the width of the pool: '));
let depth = parseFloat(prompt('Enter the depth of the pool: '));

// Volume = l * w * d
// Surface Area = 2(lw + ld + wd)
let volume = length * width * depth;
let surfaceArea = 2 * (length * width + length * depth + width * depth);

// Output the results
console.log(`Volume of the pool: ${volume.toFixed(2)} cubic units`);
console.log(`Surface Area of the pool: ${surfaceArea.toFixed(2)} square units`);