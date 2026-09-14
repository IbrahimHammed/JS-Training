const prompt = require('prompt-sync')();

let grade;

let firstName = prompt('Enter your first name: ');
console.log('\n'); // Add a newline for better readability

let lastName = prompt('Enter your last name: ');
console.log('\n'); // Add a newline for better readability

let subject = prompt('Enter the subject: ');
console.log('\n'); // Add a newline for better readability

let score = parseFloat(prompt('Enter your score (0-100): '));
console.log('\n'); // Add a newline for better readability
// Validate the score input
// Task-1: Check if the score is a valid number
if (isNaN(score)) {
    console.log('Invalid input: please enter a valid number for the score.');
} else if (score < 0) {
    // Task-2: Check if the score is < 0)
    console.log('Invalid! Negative score is not allowed. Please enter a valid score between 0 and 100.');
} else if (score > 100) {
    // Task-3: Check if the score is > 100
    console.log('Invalid! Score exceeds the maximum allowed. Please enter a valid score between 0 and 100.');
} else {
    // Determine the grade based on the score
    if (score >= 75) {
        grade = 'A1';
    } else if (score >= 70) {
        grade = 'B2';
    } else if (score >= 65) {
        grade = 'B3';
    } else if (score >= 60) {
        grade = 'C4';
    } else if (score >= 55) {
        grade = 'C5';
    } else if (score >= 50) {
        grade = 'C6';
    } else if (score >= 45) {
        grade = 'D7';
    } else if (score >= 40) {
        grade = 'E8';
    } else {
        grade = 'F9';
    }

    console.log(`Hello, ${firstName} ${lastName}! Your score of ${score}% in ${subject} earns you a grade of ${grade}.`);
}