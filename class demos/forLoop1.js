const prompt = require("prompt-sync")({ sigint: true });

firstName = prompt("Enter your first name: ");

// Use for loop to display a message 200 times
for (let i = 0; i < 200; i++) {
    console.log(`Hello, ${firstName}! Count #: (${i + 1})`);
}

// When i = 0, the message is displayed for the 1st time
// When i = 1, the message is displayed for the 2nd time
// When i = 2, the message is displayed for the 3rd time
// When i = 3, the message is displayed for the 4th time
// When i = 4, the message is displayed for the 5th time