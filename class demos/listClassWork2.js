const prompt = require('prompt-sync')();

let subjects = [];
let subject = prompt("Enter a subject (or type 'exit' or 'stop' to finish): ");

let scores = [];
let score = prompt("Enter the score for the subject: ");

while (subject.toLowerCase() !== "exit" && subject.toLowerCase() !== "stop") {
    subjects.push(subject);
    scores.push(Number(score));
    subject = prompt("Enter a subject (or type 'exit' or 'stop' to finish): ");
    score = prompt("Enter the score for the subject: ");
}

console.log("Subjects:", subjects);
console.log("Scores:", scores);