const prompt = require('prompt-sync')();

// Create a collection of people
let people = [];
let addMore = "yes";

// Collect people from user input with blank structure
while (addMore.toLowerCase() === "yes") {
    // Define a blank person object
    let person = {};
    
    // Prompt user for properties
    person.nin = prompt("Enter NIN: ");
    person.name = prompt("Enter name: ");
    person.gender = prompt("Enter gender: ");
    person.age = parseInt(prompt("Enter age: "));
    person.occupation = prompt("Enter occupation: ");
    person.salary = parseInt(prompt("Enter salary: "));
    person.city = prompt("Enter city: ");
    
    // Add the person object to the array
    people.push(person);
    
    console.log();
    console.log("Person added successfully!");
    console.log(person);
    console.log();
    
    addMore = prompt("Add another person? (yes/no): ");
}

// Check if any people were added
if (people.length === 0) {
    console.log("No people were added to the collection.");
} else {
    console.log();
    console.log("Collection of people:");
    console.table(people);
}

// Display attributes of the first person in the collection
if (people.length > 0) {
    console.log();
    console.log("Attributes of the first person in the collection:");
    console.log(people[0]);
}

// Display the attributes of a person with a given NIN
let searchNIN = prompt("Enter NIN to search for a person: ");
let foundPerson = people.find(p => p.nin === searchNIN);

if (foundPerson) {
    console.log();
    console.log("Person found:");
    console.log(foundPerson);
} else {
    console.log();
    console.log("Person with NIN " + searchNIN + " not found.");
}

// Update all other attributes of a person with a given NIN
let updateNIN = prompt("Enter NIN to of the person: ");
let personToUpdate = people.find(p => p.nin === updateNIN);

if (personToUpdate) {
    let newName = prompt("Enter new name: ");
    personToUpdate.name = newName;
    console.log();
    let newGender = prompt("Enter new gender: ");
    personToUpdate.gender = newGender;
    console.log();
    let newAge = parseInt(prompt("Enter new age: "));
    personToUpdate.age = newAge;
    console.log();
    let newOccupation = prompt("Enter new occupation: ");
    personToUpdate.occupation = newOccupation;
    console.log();
    let newSalary = parseInt(prompt("Enter new salary: "));
    personToUpdate.salary = newSalary;
    console.log();
    let newCity = prompt("Enter new city: ");
    personToUpdate.city = newCity;
} else {
    console.log();
    console.log("Person with NIN " + updateNIN + " not found.");
}

// Delete a person with a given NIN
let deleteNIN = prompt("Enter NIN to delete a person: ");
let indexToDelete = people.findIndex(p => p.nin === deleteNIN);

if (indexToDelete !== -1) {
    people.splice(indexToDelete, 1);
    console.log();
    console.log("Person with NIN " + deleteNIN + " deleted successfully.");
} else {
    console.log();
    console.log("Person with NIN " + deleteNIN + " not found.");
}

// Print the collection of people in a tablular format
console.table(people);