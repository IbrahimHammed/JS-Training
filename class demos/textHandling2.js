const prompt = require('prompt-sync')();

// Get firstname, lastname from users
let firstName, lastName;

// Input
firstName = prompt('Enter your first name: ');
lastName = prompt('Enter your last name: ');

// Output
console.log('Your first name is: ' + firstName.trim() +' and the length of your first name is: ' + firstName.trim().length);

firstName.trimEnd(); // This will remove any trailing whitespace from the firstName string, but it does not modify the original firstName variable. The length of firstName will still include any trailing whitespace, which is why the output shows the original length of firstName. To get the correct length without trailing whitespace, you can use firstName.trim().length instead.
firstName.trimStart(); // This will remove any leading whitespace from the firstName string, but it does not modify the original firstName variable. The length of firstName will still include any leading whitespace, which is why the output shows the original length of firstName. To get the correct length without leading whitespace, you can use firstName.trim().length instead.
firstName.trim(); // This will remove both leading and trailing whitespace from the firstName string, but it does not modify the original firstName variable. The length of firstName will still include any leading and trailing whitespace, which is why the output shows the original length of firstName. To get the correct length without leading and trailing whitespace, you can use firstName.trim().length instead.   


// Apartment 45B 4th Floor, 123 Main Street, Cityville, Countryland