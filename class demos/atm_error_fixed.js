const prompt = require('prompt-sync')();    

let AccountBalance = 1000; // Initial account balance

// Prompt user for withdrawal amount
let withdrawalAmount = parseFloat(prompt('Enter the amount to withdraw: '));

// Check if withdrawal amount exceeds account balance
if (withdrawalAmount > AccountBalance) {
    console.log('Error: Insufficient funds. Withdrawal amount exceeds account balance.');
} else {
    // Update account balance
    AccountBalance -= withdrawalAmount;

    // Display the updated account balance indicating the amount withdrawn
    console.log(`
        Initial Account Balance: $1000.00
        Withdrawal Amount: $${withdrawalAmount.toFixed(2)}
        Your updated account balance is: $${AccountBalance.toFixed(2)}
        `);

        // Thank user for using the ATM
        console.log('Thank you for using our ATM.');
}

