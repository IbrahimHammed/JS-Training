const prompt = require('prompt-sync')();

// Produce a dictionary for stock levels of items in a store. The user should input the number of items in the store, and then enter each item and its stock level. Finally, print the dictionary.
let stockLevel = {};
let priceList = {};

stockReply = prompt("Do you want to enter stock levels for items in the store? (yes/no): ");

while (stockReply.toLowerCase() === "yes") {
    let itemName = prompt("Enter the name of the item: ");
    let itemStock = parseInt(prompt("Enter the stock level for " + itemName + ": "));

    // Add the item and its stock level to the dictionary
    stockLevel[itemName] = itemStock;
    console.log();
    stockReply = prompt("Do you want to enter stock levels for another item? (yes/no): ");
}

priceReply = prompt("Do you want to enter prices for items in the store? (yes/no): ");
    
while (priceReply.toLowerCase() === "yes") {
    let itemName = prompt("Enter the name of the item: ");
    let itemPrice = parseFloat(prompt("Enter the price for " + itemName + ": "));

    // Add the item and its price to the price list
    priceList[itemName] = itemPrice;
    console.log();
    priceReply = prompt("Do you want to enter prices for another item? (yes/no): ");
}

// Print the dictionary
console.log("Stock levels in the store:");
console.log(stockLevel);

console.log("Prices for each item:");
console.log(priceList);