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
console.log();

while (true) {
    lastName = prompt('Enter your last name: ');
    if (typeof lastName === 'string' && lastName.trim() && isNaN(lastName.trim())) break;
    console.log('Invalid last name. Please enter a non-empty alphabetic name.');
}
console.log();

while (true) {
    mobileNumber = prompt('Enter your mobile number: ');
    const digits = mobileNumber ? mobileNumber.replace(/\D/g, '') : '';
    if (digits.length >= 7) break;
    console.log('Invalid mobile number. Please enter a valid phone number with at least 7 digits.');
}
console.log();

while (true) {
    email = prompt('Enter your email address: ');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && emailPattern.test(email)) break;
    console.log('Invalid email. Please enter a valid email address.');
}
console.log();

// Inventory with stock level (item name keys are lowercase for matching)
const inventory = {
    apple: { stock: 20, price: 1.5 },
    banana: { stock: 30, price: 0.75 },
    chocolate: { stock: 15, price: 2.5 },
    bread: { stock: 10, price: 3.0 },
};

const items = [];
let addMore = 'y';

while (addMore.toLowerCase() === 'y' || addMore.toLowerCase() === 'yes') {
    let normalizedItem;
    while (true) {
        item = prompt('Enter the item name: ');
        if (item && item.trim() && isNaN(item)) {
            normalizedItem = item.trim().toLowerCase();
            if (inventory[normalizedItem]) {
                break;
            }
            console.log('Item not found in inventory. Available items: ' + Object.keys(inventory).join(', '));
            continue;
        }
        console.log('Invalid item name. Please enter a valid item name.');
    }

    const product = inventory[normalizedItem];

    while (true) {
        quantity = parseInt(prompt(`Enter the quantity of '${normalizedItem}' to purchase (available ${product.stock}): `), 10);
        if (isNaN(quantity) || quantity < 1) {
            console.log('Invalid quantity. Please enter a valid number for quantity (1 or more).');
            continue;
        }
        if (quantity > product.stock) {
            console.log(`Insufficient stock. Only ${product.stock} unit(s) of ${normalizedItem} available.`);
            continue;
        }
        break;
    }
    console.log();

    // Use inventory price to avoid manual entry mismatch
    price = product.price;
    amount = quantity * price;
    items.push({ item: normalizedItem, quantity, price, amount });

    // Decrease stock
    product.stock -= quantity;

    addMore = prompt('Add another item? (y/n): ');
    if (!addMore) addMore = 'n';
    console.log();
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
