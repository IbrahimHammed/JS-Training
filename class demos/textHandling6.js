let message = "Hi! Welcome to JavaScript programming.";

// Hi! Welcome to JavaScript programming.
// 012345678910 11 12 13 14 15 16 17 18192021222324252627282930

//  Slice example
// Example 1
let result1 = message.slice(3, 10);
console.log(result1); // Welcome

// Example2
let result2 = message.slice(3);
console.log(result2); // Welcome to JavaScript programming.

// Example 3
let result3 = message.slice(-11);
console.log(result3); // rogramming.

//  Repeat example
console.log("--------------------------------------------")
let dash = "-";
let result4 = dash.repeat(20);
console.log(result4); 

let star = "*";
let result5 = star.repeat(10);
console.log(result5);

let hash = "#";
let result6 = hash.repeat(15);
console.log(result6);

let firstName = "Iyioluwa";
let mood = "happy";
let result7 = `My name is ${firstName} and I am feeling ${mood}.`;
console.log(result7);

let result8 = `My name is ${firstName.toUpperCase()} and I am feeling ${mood.repeat(3)}.`;
console.log(result8);

//  Replace example
// Replaces the first occurrence of "a" with "o"
let celebrity = "Samantha";
let result9 = celebrity.replace("a", "o");
console.log(result9); // Somantha

let result10 = celebrity.replace("k", "o");
console.log(result10); // Samantha (no change since "k" is not in the string)

// ReplaceAll example
// Replaces all occurrences of "a" with "o"
let result11 = celebrity.replaceAll("a", "o");
console.log(result11); // Somontho

let result12 = celebrity.replaceAll("k", "o");
console.log(result12); // Samantha (no change since "k" is not in the string)