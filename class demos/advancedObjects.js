const prompt = require('prompt-sync')();

// Define price list for items
let fruitList = [];

// Prompt the user to enter fruits until they choose to stop
let reply = 'YES';

while (reply.toUpperCase() === 'YES' || reply.toUpperCase() === 'Y') {
    let fruit = prompt('Enter a fruit name: ');

    // Add the fruit to the fruits list
    fruitList.push(fruit);
 
    console.log(); // Add a blank line for better readability
    reply = prompt('Do you want to add another fruit? (YES/NO) ');
    console.log(); // Add a blank line for better readability
}

console.log(`Our fruits are: ${fruitList.join(', ')}`);


let desiredFruit = prompt('Enter the fruit you want to check: ');

if (fruitList.includes(desiredFruit)) {
    console.log(`Yes, we have ${desiredFruit} in our list!`);
} else {
    console.log(`Sorry, we do not have ${desiredFruit} in our list.`);
}

listofFruits = ['banana', 'strawberry', 'apple', 'grapes'];
let desiredFruit2 = "grapes";

if (listofFruits.includes(desiredFruit2)) {
    console.log(`Yes, we have ${desiredFruit2} in our list!`);
} else {
    console.log(`Sorry, we do not have ${desiredFruit2} in our list.`);
}

