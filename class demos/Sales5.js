const prompt = require('prompt-sync')();

// Declare sales variables
let firstName, lastName, mobileNumber, email, item, quantity, price, amount, subTotal, vat, totalAmount;

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

// Prompt customer for items (repeat until user says no)
const items = [];
let addMore = 'y';

while (addMore.toLowerCase() === 'y' || addMore.toLowerCase() === 'yes') {
    while (true) {
        item = prompt('Enter the item name: ');
        if (item && item.trim() && isNaN(item)) {
            item = item.trim();
            break;
        }
        console.log('Invalid item name. Please enter a valid item name.');
    }

    while (true) {
        quantity = parseInt(prompt('Enter the quantity you want to purchase: '), 10);
        if (!isNaN(quantity) && quantity >= 1) {
            break;
        }
        console.log('Invalid quantity. Please enter a valid number for quantity (1 or more).');
    }

    while (true) {
        price = parseFloat(prompt('Enter the unit price of the item: '));
        if (!isNaN(price) && price >= 0) {
            break;
        }
        console.log('Invalid unit price. Please enter a valid number for unit price (0 or greater).');
    }

    amount = quantity * price;
    items.push({ item, quantity, price, amount });

    addMore = prompt('Add another item? (y/n): ');
    if (!addMore) addMore = 'n';
}

subTotal = items.reduce((sum, i) => sum + i.amount, 0);
vat = subTotal * VAT_RATE;
totalAmount = subTotal + vat;

// Display the sales details in a tabular invoice style
console.log('='.repeat(70));
console.log(' '.repeat(24) + 'INVOICE SUMMARY');
console.log('='.repeat(70));
console.log(`Customer: ${firstName} ${lastName}`);
console.log(`Phone:    ${mobileNumber}`);
console.log(`Email:    ${email}`);
console.log('-'.repeat(70));
console.log(`Item`.padEnd(30) + `Qty`.padStart(8) + `Unit Price`.padStart(14) + `Total`.padStart(14));
console.log('-'.repeat(70));
items.forEach(i => {
    console.log(`${i.item}`.padEnd(30) + `${i.quantity}`.padStart(8) + `$${i.price.toFixed(2)}`.padStart(14) + `$${i.amount.toFixed(2)}`.padStart(14));
});
console.log('-'.repeat(70));
console.log(`${'Subtotal'.padEnd(56)}$${subTotal.toFixed(2)}`);
console.log(`${'VAT (5%)'.padEnd(56)}$${vat.toFixed(2)}`);
console.log(`${'Total'.padEnd(56)}$${totalAmount.toFixed(2)}`);
console.log('='.repeat(70));
console.log(`\nThank you for your purchase, ${firstName} ${lastName}! We appreciate your business.`);
