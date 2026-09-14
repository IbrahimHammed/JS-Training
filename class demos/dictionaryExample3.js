const prompt = require('prompt-sync')();

// Demo a single object with all the needed elements
items = {
    "Smartphone": { CostPrice:5, SellingPrice: 7.8, StockLevel: 50},
    "Laptop": {CostPrice:950, SellingPrice:980.99, StockLevel: 30}
}

// Manual addition of more items
items["Tablet"] = {CostPrice:950, SellingPrice:980.99, StockLevel: 30}