// nested for loop
const prompt = require('prompt-sync')();

weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Set task list for each weekday
const tasks = {
    'Monday': ['Task 1', 'Task 2', 'Task 3', 'Task 4', 'Task 5'],
    'Tuesday': ['Task 1', 'Task 2', 'Task 3'],
    'Wednesday': ['Task 1', 'Task 2', 'Task 3'],
    'Thursday': ['Task 1', 'Task 2'],
    'Friday': ['Task 1']
};

// Outer loop for weekdays
for (let i = 0; i < weekdays.length; i++) {
    let day = weekdays[i];
    console.log(`Tasks for ${day}:`);

    // Inner loop for tasks
    for (let j = 0; j < tasks[day].length; j++) {
        console.log(`  ${tasks[day][j]} for ${day}`);
    }

    console.log(); // Add an empty line for better readability
}