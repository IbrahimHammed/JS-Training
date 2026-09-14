
// Predefined list of players
let players = ['Messi', 'Ronaldo', 'Neymar', 'Mbappe', 'Salah'];
console.log("Players:", players);

// List length
let numberOfPlayers = players.length;
console.log("Number of Players:", numberOfPlayers);

// 1st player
let firstPlayer = players[0];
console.log("1st Player:", firstPlayer);

// 3rd player
let thirdPlayer = players[2];
console.log("3rd Player:", thirdPlayer);

// Last player
let lastPlayer = players[players.length - 1];
console.log("Last Player:", lastPlayer);

// 2nd last player
let secondLastPlayer = players[players.length - 2];
console.log("2nd Last Player:", secondLastPlayer);

// Substring a list
let top3Players = players.slice(0, 3);
console.log("Top 3 Players:", top3Players);

// Players from a certain position
let playersFrom3rdPosition = players.slice(2);
console.log("Players from 3rd Position:", playersFrom3rdPosition);

let playersFrom3To4thPosition = players.slice(2, 4);
console.log("Players from 3rd to 4th Position:", playersFrom3To4thPosition);


// Remove item from the end of the list
let removedPlayer = players.pop();
console.log("Removed Player:", removedPlayer);
console.log("Players after pop:", players);

//  Add item to the start of the list
players.unshift("Lewandowski");
console.log("Players after unshift:", players);

// Remove item from the beginning of the list
let removedFirstPlayer = players.shift();
console.log("Removed First Player:", removedFirstPlayer);
console.log("Players after shift:", players);

// Add player at specific position
players.splice(2, 0, "Kane");
console.log("Players after adding Kane at index 2:", players);


// Remove player from specific position
let removedPlayerAtIndex3 = players.splice(3, 1);
console.log("Removed Player at index 3:", removedPlayerAtIndex3);
console.log("Players after removing player at index 3:", players);

// Reverse the list
players.reverse();
console.log("Players after reversing:", players);

// Sort the list
players.sort();
console.log("Players after sorting:", players);

// Find index of a player
let indexOfNeymar = players.indexOf("Neymar");
console.log("Index of Neymar:", indexOfNeymar);

// Check if a player is in the list
let isSalahInList = players.includes("Salah");
console.log("Is Salah in the list?", isSalahInList);

// Clear the list
players = [];
console.log("Players after clearing:", players);