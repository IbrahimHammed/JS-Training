const prompt = require('prompt-sync')();

// Get Voter's name
let voterName = prompt('Enter your name: ');

// Get Voter's age
let voterAge = parseInt(prompt('Enter your age: '));

// Check if the voter is eligible to vote
if (voterAge >= 18) {
    // Task-1: Display a message confirming that the voter is eligible to vote
    console.log(`Congratulations, ${voterName}! You are eligible to vote.`);

    // Task-2: Display a message encouraging the voter to participate in the upcoming election

} else {
    console.log(`Sorry, ${voterName}. You are not eligible to vote yet. Please come back when you are 18 or older.`);
}