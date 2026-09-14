const prompt = require('prompt-sync')();

// Create a collection of cars  
let cars = [];
let addMore = "yes";

// Collect cars from user input with blank structure
while (addMore.toLowerCase() === "yes") {
    // Define a blank car object
    let car = {};
    
    // Prompt user for properties
    car.plateno = prompt("Enter plate number: ");
    car.make = prompt("Enter make: ");
    car.model = prompt("Enter model: ");
    car.year = parseInt(prompt("Enter year: "));
    car.color = prompt("Enter color: ");
    car.automatic = prompt("Enter automatic (yes/no): ");
    
    // Add the car object to the array
    cars.push(car);
    
    console.log();
    console.log("Car added successfully!");
    console.log(car);
    console.log();
    
    addMore = prompt("Add another car? (yes/no): ");
}

// Check if any cars were added
if (cars.length === 0) {
    console.log("No cars were added to the collection.");
}

// Display attributes of the first car in the collection
if (cars.length > 0) {
    console.log();
    console.log("Attributes of the first car in the collection:");
    console.log(cars[0]);
}

// Display the attributes of a car with a given plate number
let searchPlateNo = prompt("Enter plate number to search for a car: ");
let foundCar = cars.find(c => c.plateno === searchPlateNo);

if (foundCar) {
    console.log();
    console.log("Car found:");
    console.log(foundCar);
} else {
    console.log();
    console.log("Car with plate number " + searchPlateNo + " not found.");
}

// Update the color of a car with a given plate number
let updatePlateNo = prompt("Enter plate number to update color: ");
let carToUpdate = cars.find(c => c.plateno === updatePlateNo);

if (carToUpdate) {
    let newColor = prompt("Enter new color: ");
    carToUpdate.color = newColor;
} else {
    console.log();
    console.log("Car with plate number " + updatePlateNo + " not found.");
}

// Delete a car with a given plate number
let deletePlateNo = prompt("Enter plate number to delete a car: ");
let indexToDelete = cars.findIndex(c => c.plateno === deletePlateNo);

if (indexToDelete !== -1) {
    cars.splice(indexToDelete, 1);
    console.log();
    console.log("Car with plate number " + deletePlateNo + " deleted successfully.");
} else {
    console.log();
    console.log("Car with plate number " + deletePlateNo + " not found.");
}

// Print the collection of cars in tablular format
console.table(cars);
