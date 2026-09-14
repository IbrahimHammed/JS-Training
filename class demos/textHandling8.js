const prompt = require('prompt-sync')();

// padEnd example
let subject = prompt('Enter a subject: ');
let score = prompt('Enter your score: ');

// Output
// This formats the output in a tabular format with the subject left-aligned and the score right-aligned
let subjectHeader = "Subject".padEnd(20, " ");
let scoreHeader = "Score".padStart(3, " ");
console.log(`${subjectHeader} | ${scoreHeader}`);

// This is just a separator line
let dash = "-".repeat(28);
console.log(dash);

// Output the subject and score with padding
let display = `${subject.padEnd(20, " ")} | ${score.padStart(3, " ")}`;
console.log(display);


let itemHeader = "Item".padEnd(20, " ");
let priceHeader = "Price".padStart(5, " ");
let qtyHeader = "Qty".padStart(3, " ");
let amtHeader = "Amount".padStart(7, " ");


let item = prompt('Enter an item: ');
let price = prompt('Enter the price: ');
let qty = prompt('Enter the quantity: ');
let amount = (parseFloat(price) * parseInt(qty)).toFixed(2);

console.log(`${itemHeader} | ${priceHeader} | ${qtyHeader} | ${amtHeader}`);
console.log("-".repeat(40));

let display2 = `${item.padEnd(20, " ")} | ${price.padStart(5, " ")} | ${qty.padStart(3, " ")} | ${amount.padStart(7, " ")}`;
console.log(display2);

