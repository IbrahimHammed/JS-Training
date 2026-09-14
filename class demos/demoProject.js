const prompt = require('prompt-sync')();

// Example-1: Collect customer information and sales record
firstname = prompt('Enter your first name: ');
lastname = prompt('Enter your last name: ');
email = prompt('Enter your email: ');
phone = prompt('Enter your phone number: ');

item = prompt('Enter the item you want to purchase: ');
quantity = parseInt(prompt('Enter the quantity of the item: '));
price = parseFloat(prompt('Enter the price of the item: '));

// Calculate total amount
amount = quantity * price;

// Print the sales record in a formatted manner
console.log(`Customer Name: ${firstname} ${lastname}`);
console.log(`Email: ${email}`);
console.log(`Phone: ${phone}`);
console.log(`Item Purchased: ${item}`);
console.log(`Quantity: ${quantity}`);
console.log(`Price per Item: $${price.toFixed(2)}`);
console.log(`Total Amount: $${amount.toFixed(2)}`);