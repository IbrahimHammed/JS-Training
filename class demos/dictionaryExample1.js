const prompt = require('prompt-sync')();

// Produce a dictionary for stock levels of items in a store. The user should input the number of items in the store, and then enter each item and its stock level. Finally, print the dictionary.
let stockLevel = {};
let priceList = {};

// Add items to the dictionary
stockLevel["Apple"] = 50;
stockLevel["Banana"] = 30;
stockLevel["Orange"] = 20;
stockLevel["Grape"] = 15;
stockLevel["Mango"] = 10;

// Add prices to the price list
priceList["Apple"] = 5.5;
priceList["Banana"] = 6.3;
priceList["Orange"] = 9.4;
priceList["Grape"] = 11.9;
priceList["Mango"] = 7.5;

// Print the dictionary
console.log("Stock levels in the store:");
console.log(stockLevel);

console.log();

console.log("Prices for each item:");
console.log(priceList);

// Display the list of items in the store
console.log();
console.log("Items in the store:");
console.log(Object.keys(stockLevel));

// Display the stock level and price for each item
console.log();
console.log("Stock levels and prices for each item:");
console.log();
console.log("------------------------------");
console.log("Item\tStock Level\tPrice");
console.log("------------------------------");

// List of valid products
let validProducts = [];

for (let item in stockLevel) {
    console.log(item + "\t" + stockLevel[item] + "\t\t" + priceList[item]);

    // Add item to valid product list
    validProducts.push(item);
}

let product = prompt("What do you want to buy?");

// Check for product validity
while (!validProducts.includes(product)) {
    console.log(`Oops! We don't sell ${product}.`);
    console.log();
    console.log(`Our Products are: ${validProducts}.`);
    console.log();
    product = prompt("What do you want to buy?");
}

let sellingPrice = priceList[product];

// Gets the current stock level of the desired product
itemStockLevel = stockLevel[product]

quantity = prompt(`How many units of ${product} do you want?`)

while (quantity > itemStockLevel)
{
    console.log(`Error! You can't buy ${quantity} when we only have ${itemStockLevel} units in store.`)
    console.log()
    quantity = prompt(`How many units of ${product} do you want?`)
}

quantity = parseInt(quantity)

amount = quantity * sellingPrice

console.log(`${quantity} units of ${product} at ${sellingPrice} costs ${amount}.`)