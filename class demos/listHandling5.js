const prompt = require('prompt-sync')();

let items = ["Pen", "Pencil", "Eraser", "Sharpener", "Notebook"];
let prices = [10, 5, 3, 7, 20];

// Accessing elements in the arrays
console.log(items[0] + ": " + prices[0]); // Pen: 10
console.log(items[1] + ": " + prices[1]); // Pencil: 5

// Access details of the last item
let lastIndex = items.length - 1;
console.log(items[lastIndex] + ": " + prices[lastIndex]); // Notebook: 20

// Create a list of fruits
let fruits = [];
let fruit = prompt("Enter a fruit (or type 'exit' or 'stop' to finish): ");

while (fruit.toLowerCase() !== "exit" && fruit.toLowerCase() !== "stop") {
    fruits.push(fruit);
    fruit = prompt("Enter a fruit (or type 'exit' or 'stop' to finish): ");
}

console.log("Fruits:", fruits);