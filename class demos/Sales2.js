const prompt = require('prompt-sync')();

// Declare sales variables
let firstName, lastName, mobileNumber, email;
let item, quantity, price, amount, vat, totalAmount;

const VAT_RATE = 0.05; // VAT rate of 5%

// Get customer details
firstName = prompt('Enter your first name: ');
lastName = prompt('Enter your last name: ');
mobileNumber = prompt('Enter your mobile number: ');
email = prompt('Enter your email address: ');

// Prompt customer for an item
item = prompt('Enter the item name: ');

// Validate item input
// We are validating that the item name is not empty and does not consist solely of numbers
if (!item.trim() || !isNaN(item)) {
    console.log('Invalid item name. Please enter a valid item name.');
    process.exit(1); // Exit the program if item name is invalid
}

// Prompt for quantity
quantity = parseInt(prompt('Enter the quantity you want to purchase: '));

// Validate quantity input
// We are validating that the quantity is a number and is greater than 0
if (isNaN(quantity) || quantity < 1) {
    console.log('Invalid quantity. Please enter a valid number for quantity.');
    process.exit(1); // Exit the program if quantity is invalid
}

//  Prompt for Unit price
price = parseFloat(prompt('Enter the unit price of the item: '));

// Validate unit price input
// We are validating that the unit price is a number and is greater than or equal to 0
if (isNaN(price) || price < 0) {
    console.log('Invalid unit price. Please enter a valid number for unit price.');
    process.exit(1); // Exit the program if unit price is invalid
}

//  Calculate amount
amount = quantity * price;

// Calculate VAT
vat = amount * VAT_RATE;

// Calculate total amount
totalAmount = amount + vat;

// Display the sales details
console.log(`Sales Details:`);
console.log(`Customer Name: ${firstName} ${lastName}`);
console.log(`Mobile Number: ${mobileNumber}`);
console.log(`Email: ${email}`);
console.log(`\n`);
console.log(`Item: ${item}`);
console.log(`Quantity: ${quantity}`);
console.log(`Unit Price: $${price.toFixed(2)}`);
console.log(`-----------------------------`);
console.log(`Amount: $${amount.toFixed(2)}`);
console.log(`VAT: $${vat.toFixed(2)}`);
console.log(`Total Amount: $${totalAmount.toFixed(2)}`);
console.log(`\n`);

// Thank the customer for their purchase
console.log(`Thank you for your purchase, ${firstName} ${lastName}! We appreciate your business.`);
