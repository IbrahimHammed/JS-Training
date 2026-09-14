// Define a dictionary object for items and thier prices and stock levels
let stock = {
    'banana': { 'UnitPrice': 100, 'Stock': 50 },
    'strawberry': { 'UnitPrice': 50, 'Stock': 30 },
    'apple': { 'UnitPrice': 80, 'Stock': 25 },
    'grapes': { 'UnitPrice': 60, 'Stock': 40 }
};

// Display unit price of a given item
let itemToCheck = 'apple';
if (stock[itemToCheck]) {
    let UnitPrice = stock[itemToCheck].UnitPrice;
    let stockLevel = stock[itemToCheck].Stock;
    let stockValue = UnitPrice * stockLevel;

    console.log(`The stock value of ${itemToCheck} is $${stockValue}.`);
}