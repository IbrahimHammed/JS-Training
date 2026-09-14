const prompt = require('prompt-sync')();

// Title: A JS script to get radius of a circle and calculate the area and circumference of the circle. Display the output in the console.
// Author: Ibrahim Hammed
// Date: 2024-06-01

// Input: Get the radius of the circle from the user
let radius = prompt('Enter the radius of the circle: ');

// Convert the input to a number
radius = parseFloat(radius);

// Calculations: Calculate the area and circumference of the circle using the formulas:
const pi = 3.142;

// Area = πr²
let area = pi * radius * radius; 

 // Circumference = 2πr
let circumference = 2 * pi * radius;

// Display the output in the console

console.log("\n");
console.log("Calculating the area and circumference of a circle...");
console.log("\n");
console.log("The area of the circle is ", area);
console.log("The circumference of the circle is ", circumference);
console.log("The area of the circle is {} and the circumference is {}", area, circumference);

console.log("\n");

console.log(`The area of a circle with radius ${radius} is: ${area}`);
console.log(`The circumference of a circle with radius ${radius} is: ${circumference}`);

console.log("\n");

console.log(`The area of a circle with radius ${radius.toFixed(2)} is: ${area.toFixed(2)}`);
console.log(`The circumference of a circle with radius ${radius.toFixed(2)} is: ${circumference.toFixed(2)}`);

console.log("\n");

result = `The area of a circle with radius ${radius.toFixed(2)} is: ${area.toFixed(2)} and the circumference is: ${circumference.toFixed(2)}`;
// console.log(result);
result;

// Result formatting
// Output format
desiredOuput = `I want radius to be here ${radius} and the area to be here ${area} and the circumference to be here ${circumference}`;
console.log(desiredOuput);

desiredOuput2 = `
                I want radius to be here ${radius} and 
                the area to be here ${area} and 
                the circumference to be here ${circumference}
                `;
console.log(desiredOuput2);

console.log("\n");
console.log("Radius: ", radius);
console.log("Area: ", area);
console.log("Circumference: ", circumference);

// Homework
// Cone: base radius, height h
// Volume = (1/3)πr²h
// Surface Area = πr(r + √(h² + r²))

// Sphere: radius r
// Volume = (4/3)πr³
// Surface Area = 4πr²

// Swimming Pool: length l, width w, depth d
// Volume = l * w * d
// Surface Area = 2(lw + ld + wd)

// Pyramid: base area A, height h
// Volume = (1/3)Ah
// Surface Area = A + (1/2) * perimeter of base * slant height