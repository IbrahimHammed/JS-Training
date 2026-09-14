const prompt = require('prompt-sync')();

// Sphere: radius r
// Volume = (4/3)πr³
// Surface Area = 4πr²

// Prompt for radius
let radius = parseFloat(prompt('Enter the radius of the sphere: '));

// Calculate volume
let volume = (4/3) * Math.PI * Math.pow(radius, 3);

// Calculate surface area
let surfaceArea = 4 * Math.PI * Math.pow(radius, 2);

// Output the results
console.log(`Volume of the sphere: ${volume.toFixed(2)}`);
console.log(`Surface Area of the sphere: ${surfaceArea.toFixed(2)}`);