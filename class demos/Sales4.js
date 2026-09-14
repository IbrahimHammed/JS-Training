const prompt = require('prompt-sync')();

// Declare sales variables
let firstName, lastName, mobileNumber, email, item, quantity, price, amount, vat, totalAmount;

const VAT_RATE = 0.05; // VAT rate of 5%

// Get customer details with validation
while (true) {
    firstName = prompt('Enter your first name: ');
    if (typeof firstName === 'string' && firstName.trim() && isNaN(firstName.trim())) break;
    console.log('Invalid first name. Please enter a non-empty alphabetic name.');
}

while (true) {
    lastName = prompt('Enter your last name: ');
    if (typeof lastName === 'string' && lastName.trim() && isNaN(lastName.trim())) break;
    console.log('Invalid last name. Please enter a non-empty alphabetic name.');
}

while (true) {
    mobileNumber = prompt('Enter your mobile number: ');
    const digits = mobileNumber ? mobileNumber.replace(/\D/g, '') : '';
    if (digits.length >= 7) break;
    console.log('Invalid mobile number. Please enter a valid phone number with at least 7 digits.');
}

while (true) {
    email = prompt('Enter your email address: ');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && emailPattern.test(email)) break;
    console.log('Invalid email. Please enter a valid email address.');
}

// Prompt customer for an item with validation
while (true) {
    item = prompt('Enter the item name: ');
    if (item && item.trim() && isNaN(item)) {
        break;
    }
    console.log('Invalid item name. Please enter a valid item name.');
}

// Prompt for quantity with validation
while (true) {
    quantity = parseInt(prompt('Enter the quantity you want to purchase: '), 10);
    if (!isNaN(quantity) && quantity >= 1) {
        break;
    }
    console.log('Invalid quantity. Please enter a valid number for quantity (1 or more).');
}

// Prompt for Unit price with validation
while (true) {
    price = parseFloat(prompt('Enter the unit price of the item: '));
    if (!isNaN(price) && price >= 0) {
        break;
    }
    console.log('Invalid unit price. Please enter a valid number for unit price (0 or greater).');
}

//  Calculate amount
amount = quantity * price;

// Calculate VAT
vat = amount * VAT_RATE;

// Calculate total amount
totalAmount = amount + vat;

// Display the sales details in a tabular invoice style
console.log('='.repeat(50));
console.log(' '.repeat(14) + 'INVOICE SUMMARY');
console.log('='.repeat(50));
console.log(`Customer: ${firstName} ${lastName}`);
console.log(`Phone:    ${mobileNumber}`);
console.log(`Email:    ${email}`);
console.log('-'.repeat(50));
console.log(`Item`.padEnd(20) + `Qty`.padStart(10) + `Unit Price`.padStart(12) + `Total`.padStart(10));
console.log('-'.repeat(50));
console.log(`${item}`.padEnd(20) + `${quantity}`.padStart(10) + `$${price.toFixed(2)}`.padStart(12) + `$${amount.toFixed(2)}`.padStart(10));
console.log('-'.repeat(50));
console.log(`${'Subtotal'.padEnd(42)}$${amount.toFixed(2)}`);
console.log(`${'VAT (5%)'.padEnd(42)}$${vat.toFixed(2)}`);
console.log(`${'Total'.padEnd(42)}$${totalAmount.toFixed(2)}`);
console.log('='.repeat(50));
console.log(`\nThank you for your purchase, ${firstName} ${lastName}! We appreciate your business.`);
