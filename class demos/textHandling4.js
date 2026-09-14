let firstName = "CHIDINMA";

// Substring examples
// C H I D I N M A
// 0 1 2 3 4 5 6 7

// APARTMENT 45B 4TH FLOOR GARAY UTCA DISTRICT VII BUDAPEST HUNGARY
// 0123456789

// example 1
// C H I D I N M A
// 0 1 2 3 4 5 6 7
let result1 = firstName.substring(2, 4);
console.log(result1); // ID

// example 2
// C H I D I N M A
// 0 1 2 3 4 5 6 7
let result2 = firstName.substring(3);
console.log(result2); // DINMA

// example 3
// C H I D I N M A
// 0 1 2 3 4 5 6 7
let result3 = firstName.substring(0, 4);
console.log(result3); // CHID

// example 4
// C H I D I N M A
// 0 1 2 3 4 5 6 7
let result4 = firstName.substring(-1);
console.log(result4); // A

// example 5
// C H I D I N M A
// 0 1 2 3 4 5 6 7
let result5 = firstName.substring(-4);
console.log(result5); // INMA

// example 6
// C H I D I N M A
// 0 1 2 3 4 5 6 7
let result6 = firstName.substring(-4, -1);
console.log(result6); // INM

// At example
// example 7
// C H I D I N M A
// 0 1 2 3 4 5 6 7
let result7 = firstName.at(0);
console.log(result7); // C

let result8 = firstName.at(-1);
console.log(result8); // A

let result9 = firstName.at(-4);
console.log(result9); // I

let result10 = firstName.at(-8);
console.log(result10); // C


// CharAt example
let lastName = "OKOYE";
let result11 = lastName.charAt(0);
console.log(result11); // O

let result12 = lastName.charAt(-1);
console.log(result12); // E

let result13 = lastName.charAt(-4);
console.log(result13); // K

let result14 = lastName.charAt(-8);
console.log(result14); // O

// example 4
// C H I D I N M A
// 0 1 2 3 4 5 6 7
let result15 = firstName[6];
console.log(result15); // M


// let paragraph = "APARTMENT 45B 4TH FLOOR GARAY UTCA DISTRICT VII BUDAPEST HUNGARY";
// let guess = prompt('Enter a word to search for: ');
// let result16 = paragraph.includes(guess);

// if(result16){
//     console.log(`The word ${guess} was found in the paragraph and it is located at index ${paragraph.indexOf(guess)}`);
// }