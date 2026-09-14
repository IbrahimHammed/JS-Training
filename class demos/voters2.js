const prompt = require('prompt-sync')();

// Get Voter's name
let voterName = prompt('Enter your name: ');

// Get Voter's age with validation
let voterAge;
while (true) {
    const ageInput = prompt('Enter your age: ');
    voterAge = parseInt(ageInput, 10);

    if (!Number.isInteger(voterAge) || voterAge < 0) {
        console.log('Invalid age entered. Please enter a valid non-negative integer age.');
        continue;
    }

    break;
}

// Check if the voter is eligible to vote
if (voterAge >= 18) {
    // Task-1: Display a message confirming that the voter is eligible to vote
    console.log(`Congratulations, ${voterName}! You are eligible to vote.`);

    // Task-2: Display a message encouraging the voter to participate in the upcoming election

} else {
    console.log(`Sorry, ${voterName}. You are not eligible to vote yet. Please come back when you are 18 or older.`);
}