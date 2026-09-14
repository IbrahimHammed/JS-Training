const prompt = require('prompt-sync')();

// Example-1
lastNumber = 5
firstNumber = 1

while (firstNumber <= lastNumber) {
    console.log(`Loop runtime: ${firstNumber}`);

    // Don't forget to update the firstNumber to avoid an infinite loop
    firstNumber = firstNumber + 1;
}

// Example-2: Simulate a simple customer service queue
reply = prompt('Is there a customer in line? (yes/no): ');

while (reply.toLowerCase() === 'yes') {
    firstName = prompt('Enter the customer\'s name: ');
    lastName = prompt('Enter the customer\'s last name: ');
    item = prompt('Enter the item the customer wants to purchase: ');
    price = parseFloat(prompt('Enter the price of the item: '));
    quantity = parseInt(prompt('Enter the quantity of the item: '));

    totalCost = price * quantity;
    console.log(`
                 Customer: ${firstName} ${lastName}, 
                 Item: ${item}, 
                 Price: $${price.toFixed(2)}, 
                 Quantity: ${quantity},
                 Total Cost: $${totalCost.toFixed(2)}
                `);
    
                console.log()

    reply = prompt('Is there a customer in line? (yes/no): ');
}

// Example-3: Print numbers from 1 to a user-defined maximum number
// Another example of while loop to validate user input
let userInput = prompt('Enter a positive number: ');

while (isNaN(userInput) || parseFloat(userInput) <= 0) {
    console.log('Invalid input. Please enter a positive number.');
    userInput = prompt('Enter a positive number: ');
}

console.log(`You entered a valid positive number: ${parseFloat(userInput)}`);


// Example-4: Validate user input for a first name using a while loop
// Let's the same approach to validate firstname for empty 
// Does not allow empty input
let firstName = prompt('Enter your first name: ');

while (firstName.trim() === '') {
    console.log('Invalid input. Please enter a valid first name.');
    firstName = prompt('Enter your first name: ');
}

console.log(`You entered a valid first name: ${firstName.trim()}`);

// Example-5: Validate user input for a first name using a while loop
// Let's the same approach to validate firstname for empty and also ensure that it is a string
// Does not allow empty input and also ensures that the input is a string (not a number or other data type)

let firstName = prompt('Enter your first name: ');

while (firstName.trim() === '' || typeof firstName !== 'string') {
    console.log('Invalid input. Please enter a valid first name.');
    firstName = prompt('Enter your first name: ');
}

console.log(`You entered a valid first name: ${firstName.trim()}`);


// Example-6: Validate user input for a first name using a while loop
// Validate to ensur that firstName does not contain numbers or special characters
// Allows just to contain letters (both uppercase and lowercase)
let firstName = prompt('Enter your first name: ');

while (firstName.trim() === '' || typeof firstName !== 'string' || /[^a-zA-Z]/.test(firstName)) {
    console.log('Invalid input. Please enter a valid first name (only letters).');
    firstName = prompt('Enter your first name: ');
}

console.log(`You entered a valid first name: ${firstName.trim()}`);


// Example-7: Validate user input for an item name, quantity, and price using while loops
let itemPurchased = prompt('Enter the item you want to purchase: ');

while (itemPurchased.trim() === '' || typeof itemPurchased !== 'string' || /[^a-zA-Z]/.test(itemPurchased)) {
    console.log('Invalid input. Please enter a valid item name.');
    itemPurchased = prompt('Enter the item you want to purchase: ');
}

console.log(`You entered a valid item name: ${itemPurchased.trim()}`);

// Example-8: Validate quantity and price using while loops
// Validate quantity to ensure that it is a positive integer
let quantity = prompt('Enter the quantity of the item: ');

while (isNaN(quantity) || parseInt(quantity) <= 0 || !Number.isInteger(parseFloat(quantity))) {
    console.log('Invalid input. Please enter a positive integer for quantity.');
    quantity = prompt('Enter the quantity of the item: ');
}

console.log(`You entered a valid quantity: ${parseInt(quantity)}`);

// Example-9: Validate price to ensure that it is a positive number (can be a decimal)
// Validate price to ensure that it is a positive number (can be a decimal)
let price = prompt('Enter the price of the item: ');

while (isNaN(price) || parseFloat(price) <= 0) {
    console.log('Invalid input. Please enter a positive number for price.');
    price = prompt('Enter the price of the item: ');
}
console.log(`You entered a valid price: $${parseFloat(price).toFixed(2)}`);

// Example-10: Check if the item is in the list of available items using a while loop
const availableItems = ['Laptop', 'Phone', 'Tablet', 'Headphones', 'Smartwatch'];

console.log() // Add an empty line for better readability
let itemPurchased = prompt('Enter the item you want to purchase: ');

// itemPurchased.trim() // Remove leading and trailing whitespace from the input
// itemPurchased.trimEnd() // Remove trailing whitespace from the input
// itemPurchased.trimStart() // Remove leading whitespace from the input

while (!availableItems.includes(itemPurchased.trim())) {
    console.log(`We don't sell ${itemPurchased}. Please enter a valid item from the list: ${availableItems.join(', ')}`);
    itemPurchased = prompt('Enter the item you want to purchase: ');
    console.log() // Add an empty line for better readability
}
console.log(`You entered a valid item: ${itemPurchased.trim()}`);