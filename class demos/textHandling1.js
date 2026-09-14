const prompt = require('prompt-sync')();

// Get firstName from user input
let firstName, middleName, lastName, fullName1, fullName2, fullName3;

// Input
firstName = prompt('Enter your first name: ');
middleName = prompt('Enter your middle name (optional): ');
lastName = prompt('Enter your last name: ');

let countryCode = prompt('Enter your country code (e.g., +1, +44): ');
let mobileNumber = prompt('Enter your mobile number: ');

let fullMobileNumber = countryCode.concat('-', mobileNumber);

// Calculate the length of the first name
let nameLength = firstName.length;

let upperCaseName = firstName.toUpperCase();
let lowerCaseName = firstName.toLowerCase();

fullName1 = firstName + ' ' + middleName + ' ' + lastName;
fullName2 = `${firstName} ${middleName} ${lastName}`; // Using template literals for full name
fullName3 = firstName.concat(' ', middleName, ' ', lastName); // Using concat method for full name

// Output
console.log('Your first name is: ' + firstName);
console.log('Your first name in uppercase is: ' + upperCaseName);
console.log('Your first name in lowercase is: ' + lowerCaseName);
console.log(`Your first name is: ${firstName} and it is ${nameLength} characters long.`);

console.log('Your full name is: ' + fullName1);
console.log('Your full name is: ' + fullName2);
console.log('Your full name is: ' + fullName3);

console.log('Your full mobile number is: ' + fullMobileNumber);