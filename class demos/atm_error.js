const prompt = require('prompt-sync')();    

let AccountBalance = 1000; // Initial account balance

// Prompt user for withdrawal amount
let withdrawalAmount = parseFloat(prompt('Enter the amount to withdraw: '));

// Update account balance
AccountBalance -= withdrawalAmount;

// / Display the updated account balance
console.log(`Your updated account balance is: $${AccountBalance.toFixed(2)}`);

// Thank user for using the ATM
console.log('Thank you for using our ATM.');
