const fs = require('fs');
const prompt = require('prompt-sync')();

// Function to create a new MS excel file with the specified content
function createExcelFile(filePath, content) {
    fs.writeFile(filePath, content, (err) => {
        if (err) {
            console.error(`Error creating Excel file at ${filePath}:`, err);
        } else {
            console.log(`Excel file created successfully at ${filePath}`);
        }
    });
}

// Function to read the content of an MS excel file
function readExcelFile(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading Excel file at ${filePath}:`, err);
        } else {
            console.log(`Excel file content at ${filePath}:`, data);
        }
    });
}

// Collect many item details
const items = [];

while (true) {
    const item = prompt('Enter item name (press Enter to finish): ');
    
    if (!item) {
        break;
    }

    const priceInput = prompt('Enter price: ');
    const quantityInput = prompt('Enter quantity: ');
    const price = parseFloat(priceInput);
    const quantity = parseFloat(quantityInput);

    if (Number.isNaN(price) || Number.isNaN(quantity)) {
        console.log('Invalid price or quantity. Please try again.');
        continue;
    }

    const amount = price * quantity;
    items.push({ item, price, quantity, amount });
}

if (items.length === 0) {
    console.log('No items entered. Exiting.');
    process.exit(0);
}

// Handle label for headers
const header = 'Item\tPrice\tQuantity\tAmount';

// Generate the content for the Excel file
const rows = items.map(({ item, price, quantity, amount }) =>
    `${item}\t${price.toFixed(2)}\t${quantity.toFixed(2)}\t${amount.toFixed(2)}`
);

const totalAmount = items.reduce((sum, entry) => sum + entry.amount, 0);
const content = [header, ...rows, `\t\tTotal\t${totalAmount.toFixed(2)}`].join('\n');
const filePath = 'invoice.xls';

createExcelFile(filePath, content);


