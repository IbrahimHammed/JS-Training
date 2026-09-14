const prompt = require('prompt-sync')();

// Create a collection of students  
let students = [];
let addMore = "yes";

// Collect students from user input with blank structure
while (addMore.toLowerCase() === "yes") {
    // Define a blank student object
    let student = {};
    
    // Prompt user for properties
    student.nin = prompt("Enter NIN: ");
    student.name = prompt("Enter name: ");
    student.age = parseInt(prompt("Enter age: "));
    student.major = prompt("Enter major: ");
    student.hobbies = prompt("Enter hobbies (comma-separated): ");
    
    // Add the student object to the array
    students.push(student);
    
    console.log();
    console.log("Student added successfully!");
    console.log(student);
    console.log();
    
    addMore = prompt("Add another student? (yes/no): ");
}

// Check if any students were added
if (students.length === 0) {
    console.log("No students were added to the collection.");
}

// Display attributes of the first student in the collection
if (students.length > 0) {
    console.log();
    console.log("Attributes of the first student in the collection:");
    console.log(students[0]);
}

// Display the attributes of a student with a given NIN
let searchNIN = prompt("Enter NIN to search for a student: ");
let foundStudent = students.find(s => s.nin === searchNIN);

if (foundStudent) {
    console.log();
    console.log("Student found:");
    console.log(foundStudent);
} else {
    console.log();
    console.log("Student with NIN " + searchNIN + " not found.");
}

// Update the major of a student with a given NIN
let updateNIN = prompt("Enter NIN to update major: ");
let studentToUpdate = students.find(s => s.nin === updateNIN);

if (studentToUpdate) {
    let newMajor = prompt("Enter new major: ");
    studentToUpdate.major = newMajor;
} else {
    console.log();
    console.log("Student with NIN " + updateNIN + " not found.");
}

// Delete a student with a given NIN
let deleteNIN = prompt("Enter NIN to delete a student: ");
let indexToDelete = students.findIndex(s => s.nin === deleteNIN);

if (indexToDelete !== -1) {
    students.splice(indexToDelete, 1);
    console.log();
    console.log("Student with NIN " + deleteNIN + " deleted successfully.");
} else {
    console.log();
    console.log("Student with NIN " + deleteNIN + " not found.");
}

// Print the collection of students in tablular format
console.table(students);
