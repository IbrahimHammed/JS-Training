const prompt = require('prompt-sync')();

// Prompt for radius and height
let radius = parseFloat(prompt('Enter the base radius of the cone: '));
let height = parseFloat(prompt('Enter the height of the cone: '));

// Cone: base radius, height h
// Volume = (1/3)πr²h
let vol = (1/3) * Math.PI * Math.pow(radius, 2) * height;

// Surface Area = πr(r + √(h² + r²))
let surfaceArea = Math.PI * radius * (radius + Math.sqrt(height**2 + radius**2));

//  Output the results
console.log(`Volume of the cone: ${vol.toFixed(2)}`);
console.log(`Surface Area of the cone: ${surfaceArea.toFixed(2)}`);

