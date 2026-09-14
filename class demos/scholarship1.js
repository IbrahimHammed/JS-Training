const prompt = require('prompt-sync')();

// Prompt for first name
let firstName = prompt('Enter your first name: ');

// Prompt for last name
let lastName = prompt('Enter your last name: ');

// Prompt for gender
let gender = prompt('Enter your gender (M/F): ');

// Prompt for age
let age = parseInt(prompt('Enter your age: '));

// Validate age input
if (isNaN(age)) {
    console.log('Invalid age entered. Please enter a valid number for age.');
} else if (age < 0) {
    console.log('Invalid age entered. Age cannot be negative. Please enter a valid age.');
} 

// Scholarship eligibility check using AND operator (&&)
if (gender.toUpperCase() === 'F' && age <= 21 && age >= 18) {
    console.log(`Congratulations, ${firstName} ${lastName}! You are eligible for the scholarship.`);
} else {
    console.log(`Sorry, ${firstName} ${lastName}. You do not meet the eligibility criteria for the scholarship.`);
}
