const prompt = require('prompt-sync')();

const currentYear = new Date().getFullYear();

// function to determine letter grade
function getAge(BirthYear) {
    const age = currentYear - BirthYear;
    return age;
}

// Get the age and display it
function displayAge() {
    const age = getAge(BirthYear);
    console.log(`You are ${age} years old.`);
}

// Prompt for birth year
BirthYear = parseInt(prompt("Enter your birth year: "));

if (BirthYear > currentYear) {
    console.log("Error! Birth year can't be in the future!");
    process.exit(1);
} else if (BirthYear < 1930) {
    console.log("Error! Folks born in 1930 shouldn't be using this program!");
    process.exit(1);
} else if (isNaN(BirthYear)) {
    console.log("Error! Birth year must be a valid number!");
    process.exit(1);
} else {
    console.log("Calculating your age...");
    console.log();
    displayAge();
}


