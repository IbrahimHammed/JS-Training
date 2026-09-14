const prompt = require ('prompt-sync')();

// prompt for firstname
let firstName = prompt('Enter your first name: ');

//prompt for last name
let lastName = prompt('Enter your last name: ');

// Prompt for mobile number
let mobileNumber = prompt('Enter your mobile number: ');

// Prompt for email address
let email = prompt('Enter your email address: ');

// Define price list for items
let priceList = {
    'banana': 10,
    'strawberry': 5,
    'apple': 11,
    'grapes': 4
};

// Define stock quantity for items
let stock = {
    'banana': 100,
    'strawberry': 50,
    'apple': 80,
    'grapes': 60
};

let itemContainer = [];
let quantityContainer = [];
let priceContainer = [];
let amountContainer = [];

let reply = 'YES';
let subtotal = 0;

// Put a blank row for better readability
console.log(); 

while (reply.toUpperCase() === 'YES' || reply.toUpperCase() === 'Y') {
    let item = prompt('Enter item name: ').toLowerCase();

    // Add the item to the item container
    itemContainer.push(item);

    // Get stock quantity for the item, default to 0 if item is not in stock
    let availableStock = stock[item] || 0;

    // Check if the item is in the price list
    if (priceList[item]) {
        // Prompt for quantity
        let quantity = parseInt(prompt(`Enter quantity for ${item} (Stock Level: ${availableStock}): `));

        // Check if the quantity is available in stock
        if (quantity > stock[item]) {
            console.log(`Sorry, we only have ${stock[item]} unit(s) of ${item} in stock.`);
            continue; // Skip to the next iteration of the loop
        }

        // Add the item details to the respective lists
        quantityContainer.push(quantity);
        
        
        // Calculate the subtotal for the item and update stock
        let price = priceList[item];
        priceContainer.push(price);
        
        amount = price * quantity;
        amountContainer.push(amount);

        subtotal += amount;

        stock[item] -= quantity; // Update stock after purchase
    } else {
        console.log(`Sorry, we do not have ${item} in our price list.`);
        console.log('Available items are: ' + Object.keys(priceList).join(', '));
    }

    // Put a blank row for better readability
    console.log(); 

    // Ask if the customer wants to add another item
    reply = prompt('Add another item? (YES/NO)');

    // Put a blank row for better readability
    console.log(); 
}

console.log();

let vatRate = 0.05; // VAT rate of 5%
let vat = subtotal * vatRate;
let total = subtotal + vat;

// Display the company name and customer details
console.log('**************************************');
console.log('Company Name: Fresh Fruits Ltd.');
console.log('Address: 123 Fruit Street, Fruitville');
console.log('**************************************');
console.log();
console.log(`Customer Name: ${firstName} ${lastName}`);
console.log(`Mobile Number: ${mobileNumber}`);
console.log(`Email: ${email}`);
console.log();
console.log("Transaction Date: " + new Date().toLocaleDateString());
console.log()

// Display the sales details in tabular format
console.log('------------------------------------------------------');
console.log('Item\t\tQuantity\tUnit Price\tAmount');
console.log('------------------------------------------------------');

for (let i = 0; i < itemContainer.length; i++) {
    console.log(`${itemContainer[i]}\t\t${quantityContainer[i]}\t\t$${priceContainer[i].toFixed(2)}\t\t$${amountContainer[i].toFixed(2)}`);
}


console.log('------------------------------------------------------');
console.log(`Subtotal:\t\t\t\t\t$${subtotal.toFixed(2)}`);
console.log(`VAT (5%):\t\t\t\t\t$${vat.toFixed(2)}`);
console.log(`Total Amount:\t\t\t\t$${total.toFixed(2)}`);
console.log();

// Thank the customer for their purchase
console.log(`Thank you for your purchase, ${firstName} ${lastName}! We appreciate your business.`);
