let prompt = require('prompt-sync')();

// print 1-10 on the screen using for loop structure
// for (let i = 1; i <= 10; i++) {
//     console.log(i);
// }

// console.log();

// // print 10-1 on the screen using for loop structure
// for (let i = 10; i >= 1; i--) {
//     console.log(i);
// }

// console.log();

// print even numbers from 1-10 on the screen using for loop structure
// for (let i = 1; i <= 10; i++) {
//     // if the number is divisible by 2, then it is an even number
//     if (i % 2 === 0) {
//         console.log(i);
//     }
// }

// for (let i = 1; i <= 10; i++) {
//     // if the number is divisible by 2, then it is an even number
//     if (i % 2 === 0) {
//         console.log(`Even number: ${i}`);
//     }
//     else {
//         console.log(`${i} is excluded because it is an odd number.`);
//     }
// }

// print odd numbers from 1-10 on the screen using for loop structure
// for (let i = 1; i <= 10; i++) {
//     // if the number is not divisible by 2, then it is an odd number
//     let remainder = i % 2;

//     if (remainder !== 0) {  
//         console.log(i);
//     }
// }

// let x = 13 % 2;
// console.log(x);

// // print multiples of 5 from 1-100 on the screen using for loop structure
// for (let i = 1; i <= 100; i++) {
//     // if the number is divisible by 5, then it is a multiple of 5
//     let remainder = i % 5;
//     if (remainder === 0) {
//         console.log(`${i} is a multiple of 5.`);
//     }
// }

// // print multiples of 15 from 1-100 on the screen using for loop structure
// for (let i = 1; i <= 100; i++) {
//     // if the number is divisible by 15, then it is a multiple of 15
//     if (i % 15 === 0) {
//         console.log(`${i} is a multiple of 15.`);
//     }
// }

// This creates an empty array called fruits to store the names of the fruits entered by the user.
let fruits = [];

for (let i = 1; i <= 5; i++) {
    let fruit = prompt(`Enter the name of fruit ${i}: `);
    fruits.push(fruit);
}

console.log("The fruits you entered are:");
for (let i = 0; i < fruits.length; i++) {
    console.log(fruits[i]);
}

console.log("The fruits you entered are:", fruits);
