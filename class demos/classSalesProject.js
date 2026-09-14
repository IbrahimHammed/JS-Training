const prompt = require('prompt-sync')();

customerReply = prompt('Is there a customer in queue? (yes/no): ');

while (customerReply.toLowerCase() === 'yes') {
    customerName = prompt('Enter the customer name: ');
    customerEmail = prompt('Enter the customer email: ');
    customerPhone = prompt('Enter the customer phone number: ');
    salesDate = prompt('Enter the sales date (YYYY-MM-DD): ');

    console.log();

    productReply = "yes";
    
    // Initialize an empty array to store products for the current customer
    let products = [];

    while (productReply.toLowerCase() === 'yes') {
        let productName = prompt('Enter the product name: ');
        let quantity = parseInt(prompt('Enter the quantity of the product: '));
        let price = parseFloat(prompt('Enter the price of the product: '));
        products.push({ productName, quantity, price });

        productReply = prompt('Is there another product to add to the sales record? (yes/no): ');

        // Add an empty line for better readability
        console.log();
    }
}
