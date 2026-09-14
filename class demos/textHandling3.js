const prompt = require('prompt-sync')();

let firstName = prompt('Enter your first name: ');

// Starts with a specific charcater
console.log('Does the first name start with "A"? ' + firstName.startsWith('A'));
console.log('Does the first name start with "Ade"? ' + firstName.startsWith('Ade'));

// Ends with a specific character
console.log('Does the first name end with "n"? ' + firstName.endsWith('n'));
console.log('Does the first name end with "man"? ' + firstName.endsWith('man'));

// Includes a specific character
console.log('Does the first name include "C"? ' + firstName.includes('C'));
console.log('Does the first name include "din"? ' + firstName.includes('din'));

//  Substring
let result = firstName.substring(3); 
let result2 = firstName.substring(0, 4);
let result3 = firstName.substring(2, 5);

console
console.log('Substring of first name: ' + result);
console.log('Substring of first name: ' + result2);
console.log('Substring of first name: ' + result3);

// C H I D I N M A
// 0 1 2 3 4 5 6 7

// A B D U R R A H M A N
// 0 1 2 3 4 5 6 7 8 9 10

