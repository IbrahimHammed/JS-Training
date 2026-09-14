const prompt = require('prompt-sync')();

// Create a list of items for sale
const itemsForSale = [
    { name: 'Laptop', price: 1000, stockQuantity: 5 },
    { name: 'Smartphone', price: 500, stockQuantity: 10 },
    { name: 'Headphones', price: 100, stockQuantity: 20 },
    { name: 'Smartwatch', price: 200, stockQuantity: 15 }
];

// Get customer details
const firstName = prompt('Enter your first name: ');
const lastName = prompt('Enter your last name: ');
const mobileNumber = prompt('Enter your mobile number: ');
const email = prompt('Enter your email address: ');

// Display items for sale
console.log('Items for Sale:');
itemsForSale.forEach((item, index) => {
    console.log(`${index + 1}. ${item.name} - $${item.price} (Stock: ${item.stockQuantity})`);
});

// Prompt customer to select an item
const itemSelection = parseInt(prompt('Select an item by entering the corresponding number: '));
if (isNaN(itemSelection) || itemSelection < 1 || itemSelection > itemsForSale.length) {
    console.log('Invalid selection. Please select a valid item number.');
} else {
    const selectedItem = itemsForSale[itemSelection - 1];
    const quantity = parseInt(prompt(`Enter the quantity of ${selectedItem.name} you want to purchase: `));
    if (isNaN(quantity) || quantity < 1) {
        console.log('Invalid quantity. Please enter a valid number for quantity.');
    } else if (quantity > selectedItem.stockQuantity) {
        console.log(`Sorry, we only have ${selectedItem.stockQuantity} ${selectedItem.name}(s) in stock.`);
    } else {
        const totalPrice = selectedItem.price * quantity;
        console.log(`Thank you for your purchase, ${firstName} ${lastName}! You bought ${quantity} ${selectedItem.name}(s) for a total of $${totalPrice}.`);    
        // Update stock quantity
        selectedItem.stockQuantity -= quantity;
    }
}

