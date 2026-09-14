const prompt = require('prompt-sync')();

function getValidatedScore(promptText, maxAllowed) {
    while (true) {
        const raw = prompt(promptText);
        const value = parseFloat(raw);

        if (!Number.isFinite(value)) {
            console.log('Invalid input: please enter a valid number.');
            continue;
        }

        if (value < 0 || value > maxAllowed) {
            console.log(`Invalid entry: value must be between 0 and ${maxAllowed}. Please try again.`);
            continue;
        }

        return value;
    }
}

const continousAssessment = getValidatedScore('Enter the score for continuous assessment (MAX. 30%): ', 30);
const finalExam = getValidatedScore('Enter the score for final exam (MAX. 70%): ', 70);

const totalScore = continousAssessment + finalExam;
console.log(`Total score: ${totalScore}`);