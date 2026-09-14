// This line is used to import the prompt-sync module, which allows us to get user input from the console
const prompt = require('prompt-sync')();

// This line is used to import the fs module, which allows us to work with the file system (e.g., read/write files)
// fs means file system, and it is a built-in module in Node.js that provides functions for working with files and directories.
const fs = require('fs');

// Global products array
let products = [];
let stockItems = [];

// Currency formatter (adjust currency code as needed)
const currencyFormatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });
function formatCurrency(v) {
    if (v === null || v === undefined || isNaN(v)) return v;
    return currencyFormatter.format(v);
}

function productsForDisplay(arr) {
    return arr.map(p => ({
        Code: p.Code,
        Name: p.Name,
        CostPrice: p.CostPrice != null ? formatCurrency(p.CostPrice) : p.CostPrice,
        SellingPrice: p.SellingPrice != null ? formatCurrency(p.SellingPrice) : p.SellingPrice
    }));
}

function lineItemsForDisplay(items) {
    return items.map(i => ({
        Code: i.Code,
        Name: i.Name,
        UnitPrice: i.UnitPrice != null ? formatCurrency(i.UnitPrice) : i.UnitPrice,
        Quantity: i.Quantity,
        LineTotal: formatCurrency(i.LineTotal)
    }));
}

function addProducts() {
    let addMore = "yes";
    while (addMore.toLowerCase() === "yes") {
        // Define a blank product object
        let product = {};

        // Prompt user for product properties
        product.Code = prompt("Enter product code: ");
        product.Name = prompt("Enter product name: ");
        product.CostPrice = parseFloat(prompt("Enter cost price: "));
        product.SellingPrice = parseFloat(prompt("Enter selling price: "));

        // Add the product object to the products array
        products.push(product);

        console.log();
        console.log("Product added successfully!");
        // show product with formatted currency for display
        console.log({ Code: product.Code, Name: product.Name, CostPrice: formatCurrency(product.CostPrice), SellingPrice: formatCurrency(product.SellingPrice) });
        console.log();
        console.table(productsForDisplay(products));
        console.log();
        addMore = prompt("Do you want to add another product? (yes/no): ");
    }

    // Save products to products.json file
    fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
    console.log("Products saved to products.json.");
}

// Function to set up products
function productSetup() {
    console.log("You have selected the module for Product setup.");
    console.log();
    
    // Open products.json file and read existing products if it exists
    if (fs.existsSync('products.json')) {
        const data = fs.readFileSync('products.json');
        if (data.length > 0) {
            products = JSON.parse(data);
            console.log("Existing products loaded from products.json:");
            console.table(productsForDisplay(products));

            let addMore = prompt("Do you want to add more products? (yes/no): ");
            if (addMore.toLowerCase() === "yes") addProducts();
        } else {
            console.log("No products found in products.json. Please add products.");
            addProducts();
        }
    } else {
        console.log("products.json file not found. Please add products.");
        addProducts();
    }
}

// Function to handle invoicing: accepts multiple items and validates quantity
function invoicing() {
    console.log("Invoicing selected.");

    let reply = prompt("Is there a customer waiting for a transaction? (yes/no): ");
    while (reply.toLowerCase() !== "yes" && reply.toLowerCase() !== "no") {
        console.log("Invalid input. Please enter 'yes' or 'no'.");
        reply = prompt("Is there a customer waiting for a transaction? (yes/no): ");
    }
    if (reply.toLowerCase() !== "yes") { console.log("No customer waiting. Returning."); return; }

    // customer details
    let customerName = prompt("Enter customer name: ");
    let customerMobile = prompt("Enter customer mobile number: ");
    let customerEmail = prompt("Enter customer email: ");

    // load products if needed
    if (products.length === 0 && fs.existsSync('products.json')) {
        try { products = JSON.parse(fs.readFileSync('products.json')); } catch (e) { products = []; }
    }
    if (products.length === 0) { console.log('No products available. Run Product setup.'); return; }

    // load stock and invoice history, then create or refresh inventory.json
    let inventoryArray = [];
    let stockArray = [];
    if (fs.existsSync('stock.json')) {
        try { stockArray = JSON.parse(fs.readFileSync('stock.json')); } catch (e) { stockArray = []; }
    }

    let invoices = [];
    if (fs.existsSync('invoices.json')) {
        try { invoices = JSON.parse(fs.readFileSync('invoices.json')); } catch (e) { invoices = []; }
    }

    const stockedQuantities = stockArray.reduce((acc, item) => {
        if (!item || !item.ProductCode) return acc;
        acc[item.ProductCode] = (acc[item.ProductCode] || 0) + Number(item.Quantity || 0);
        return acc;
    }, {});

    const soldQuantities = invoices.reduce((acc, invoice) => {
        if (!invoice || !Array.isArray(invoice.items)) return acc;
        for (const item of invoice.items) {
            if (!item || !item.Code) continue;
            acc[item.Code] = (acc[item.Code] || 0) + Number(item.Quantity || 0);
        }
        return acc;
    }, {});

    const productCodes = new Set([
        ...Object.keys(stockedQuantities),
        ...Object.keys(soldQuantities),
        ...products.map(p => p.Code)
    ]);

    productCodes.forEach(code => {
        const totalStocked = stockedQuantities[code] || 0;
        const totalSold = soldQuantities[code] || 0;
        inventoryArray.push({
            ProductCode: code,
            TotalQuantityStocked: totalStocked,
            TotalQuantitySold: totalSold,
            StockLevel: Math.max(0, totalStocked - totalSold)
        });
    });

    fs.writeFileSync('inventory.json', JSON.stringify(inventoryArray, null, 2));
    console.log('Inventory refreshed from stock.json and invoices.json.');

    let lineItems = [];
    let addMore = 'yes';
    console.log('Available products:'); console.table(productsForDisplay(products));

    while (addMore.toLowerCase() === 'yes') {
        let code = prompt('Enter product code to purchase: ');
        let prod = products.find(p => p.Code === code);
        if (!prod) { console.log('Invalid product code.'); continue; }

        // compute available stock (if inventory present)
        let inv = inventoryArray.find(i => i.ProductCode === code);
        let alreadyRequested = lineItems.filter(li => li.Code === code).reduce((s,li)=>s+li.Quantity,0);
        let available = inv ? inv.StockLevel - alreadyRequested : 0;
        if (available <= 0) { console.log(`No stock available for ${prod.Name}.`); continue; }

        let qty = parseInt(prompt('Enter quantity to purchase: '));
        if (isNaN(qty) || qty <= 0) { console.log('Invalid quantity.'); continue; }
        if (qty > available) { console.log(`Insufficient stock. Available: ${available}.`); continue; }

        let lineTotal = qty * parseFloat(prod.SellingPrice || 0);
        lineItems.push({ Code: prod.Code, Name: prod.Name, UnitPrice: prod.SellingPrice, Quantity: qty, LineTotal: lineTotal });

        console.log('Added item:'); console.table(lineItemsForDisplay(lineItems));
        addMore = prompt('Add another product? (yes/no): ');
        while (addMore.toLowerCase() !== 'yes' && addMore.toLowerCase() !== 'no') addMore = prompt('Please answer "yes" or "no": ');
    }

    if (lineItems.length === 0) { console.log('No items added.'); return; }

    // Calculate subtotal, VAT (5%) and total amount, then display invoice
    let subtotal = lineItems.reduce((s,it)=>s+it.LineTotal,0);
    const vatRate = 0.05;
    let vat = Number((subtotal * vatRate).toFixed(2));
    let totalAmount = Number((subtotal + vat).toFixed(2));

    console.log(); 
    console.log('Invoice for', customerName); 
    console.table(lineItemsForDisplay(lineItems)); 
    console.log('Subtotal:', formatCurrency(subtotal));
    console.log('VAT (5%):', formatCurrency(vat));
    console.log('Total Amount:', formatCurrency(totalAmount));

    // save invoice (include VAT and totalAmount)
    const invoice = { timestamp: new Date().toISOString(), customer: { name: customerName, mobile: customerMobile, email: customerEmail }, items: lineItems, subtotal, vat, totalAmount };
    let savedInvoices = [];
    if (fs.existsSync('invoices.json')) { try { savedInvoices = JSON.parse(fs.readFileSync('invoices.json')); } catch(e){ savedInvoices = []; } }
    
    // Add the new invoice to the array and save back to invoices.json
    savedInvoices.push(invoice); fs.writeFileSync('invoices.json', JSON.stringify(savedInvoices, null, 2));
    console.log('Invoice saved to invoices.json');

    // update inventory totals for the newly saved invoice
    if (inventoryArray.length > 0) {
        for (let li of lineItems) {
            let entry = inventoryArray.find(i => i.ProductCode === li.Code);
            if (!entry) {
                entry = {
                    ProductCode: li.Code,
                    TotalQuantityStocked: 0,
                    TotalQuantitySold: 0,
                    StockLevel: 0
                };
                inventoryArray.push(entry);
            }
            entry.TotalQuantitySold += li.Quantity;
            entry.StockLevel = Math.max(0, entry.TotalQuantityStocked - entry.TotalQuantitySold);
        }

        // save updated inventory back to inventory.json
        fs.writeFileSync('inventory.json', JSON.stringify(inventoryArray, null, 2));
        console.log('Inventory updated in inventory.json');
    }
}

// Function for Inventory Management
function inventoryManagement() {
    console.log("Inventory Management selected.");
    // Inventory management code goes here
    // check if products.json file exists and load products
    if (fs.existsSync('products.json')) {
        const data = fs.readFileSync('products.json');
        if (data.length > 0) {
            products = JSON.parse(data);
            console.log("Existing products loaded from products.json:");
            console.table(products);

            console.log();

            // prompt for existing stock items
            let addMore = prompt("Do you want to add stock items? (yes/no): ");
            if (addMore.toLowerCase() === "yes") {
                // code to add stock items goes here
                // get product code for stock item
                let productCode = prompt("Enter product code for stock item: ");
                let product = products.find(p => p.Code === productCode);
                if (product) {
                    let quantity = parseInt(prompt("Enter quantity of stock item: "));
                    let purchaseDate = prompt("Enter purchase date (YYYY-MM-DD): ");
                    let SupplierName = prompt("Enter supplier name: ");

                    // Create stock item object and add to stockItems array
                    let stockItem = {
                        ProductCode: productCode,
                        Quantity: quantity,
                        PurchaseDate: purchaseDate,
                        SupplierName: SupplierName
                    };
                    
                    stockItems.push(stockItem);
                    console.log("Stock item added successfully!");
                    console.table(stockItems);
                } else {
                    console.log("Invalid product code. Please try again.");
                }

                // prompt to add more stock items
                addMore = prompt("Do you want to add more stock items? (yes/no): ");
                if (addMore.toLowerCase() === "yes") {
                    // code to add more stock items goes here (can be a loop or recursive call)
                    // For simplicity, we can call the inventoryManagement function again to add more stock items
                    inventoryManagement();
                }
                else {
                    // write stock items to stock.json file
                    fs.writeFileSync('stock.json', JSON.stringify(stockItems, null, 2));
                    console.log("Stock items saved to stock.json.");

                    // display stock items in a table format
                    console.table(stockItems);

                    // send user to main menu after managing inventory
                    console.log("Returning to main menu...");

                }
            }
        } else {
            console.log("No products found in products.json. Please set up products first.");
        }
    } else {
        console.log("products.json file not found. Please set up products first.");
        productSetup();
    }
}

// Function to generate management report
function managementReport() {
    console.log("Management Report selected.");
    // Management report code goes here
}


// Create a welcome banner showing the name of the program and the author
console.log()
// Draw a line with *
console.log("*".repeat(100));
console.log(" ".repeat(40) + "Welcome to the Invoice App!");
// Draw a line with *
console.log("*".repeat(100));
console.log();

// Console for tasks available in the program
console.log("Please select an option:");
console.log();
console.log("1. Product setup");
console.log("2. Inventory Management");
console.log("3. Invoicing");
console.log("4. Management Report");
console.log("5. Exit");
console.log();

let choice = prompt("Select an option (1-5): ");

while (choice !== "5") {
    if (choice === "1") {
        // Call product setup function here
        productSetup();
    } else if (choice === "2") {
        console.log("Inventory Management selected.");
        // Call inventory management function here
        inventoryManagement();
    } else if (choice === "3") {
        console.log("Invoicing selected.");
        // Call invoicing function here
        invoicing();
    } else if (choice === "4") {
        console.log("Management Report selected.");
        // Call management report function here
        managementReport();
    } else {
        console.log("Invalid choice. Please enter 1, 2, 3, 4, or 5.");
    }

    console.log();
    choice = prompt("Select an option (1-5): ");
    console.log();
}

console.log("Thank you for using the Invoice App. Goodbye!");