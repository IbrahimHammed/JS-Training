const prompt = require('prompt-sync')();

// function to determine letter grade
function getGrade(score) {
    if (score >= 75) {
        return "A1";
    } else if (score >= 70) {
        return "B2";
    } else if (score >= 65) {
        return "B3";
    } else if (score >= 60) {
        return "C4";
    } else if (score >= 55) {
        return "C5";
    } else if (score >= 50) {
        return "C6";
    } else if (score >= 45) {
        return "D7";
    } else if (score >= 40) {
        return "E8";
    } else if (score >= 0) {
        return "F9";
    } else {
        return "Invalid score";
    }
}

// Prompt for a score
score = parseInt(prompt("Enter your score (0-100): "));

// Get the letter grade and display it
grade = getGrade(score);
console.log(`Your score of ${score} corresponds to a grade of ${grade}.`);