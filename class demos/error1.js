const prompt = require('prompt-sync')();    

let continousAssessment = parseFloat(prompt('Enter the score for continuous assessment (MAX. 30%): '));
let finalExam = parseFloat(prompt('Enter the score for final exam (MAX. 70%): '));

let totalScore = continousAssessment + finalExam;

console.log(`Total score: ${totalScore}`);