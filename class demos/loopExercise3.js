// nested for loop
const prompt = require('prompt-sync')();

weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

taskCount = parseInt(prompt('Enter the number of tasks: '));

// Outer loop for weekdays
for (let i = 0; i < weekdays.length; i++) {
    let day = weekdays[i];
    console.log(`Tasks for ${day}:`);

    // Inner loop for tasks
    for (let j = 1; j <= taskCount; j++) {
        console.log(`  Task ${j} for ${day}`);
    }

    console.log(); // Add an empty line for better readability
}