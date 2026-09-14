const fs = require('fs');

// Function to create a new file with the specified content
function createFile(filePath, content) {
    fs.writeFile(filePath, content, (err) => {
        if (err) {
            console.error(`Error creating file at ${filePath}:`, err);
        } else {
            console.log(`File created successfully at ${filePath}`);
        }
    });
}

// Function to read the content of a file
function readFile(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file at ${filePath}:`, err);
        } else {
            console.log(`File content at ${filePath}:`, data);
        }
    });
}

// Function to update the content of a file
function updateFile(filePath, newContent) {
    fs.writeFile(filePath, newContent, (err) => {
        if (err) {
            console.error(`Error updating file at ${filePath}:`, err);
        } else {
            console.log(`File updated successfully at ${filePath}`);
        }
    });
}

// Function to delete a file
function deleteFile(filePath) {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(`Error deleting file at ${filePath}:`, err);
        } else {
            console.log(`File deleted successfully at ${filePath}`);
        }
    });
}


// Example-1: Create a new file
const filePath = 'example.txt';
const content = 'This is an example file created using Node.js.';
createFile(filePath, content);

// Example-2: Read the content of the file
readFile(filePath);

// Example-3: Update the content of the file
const newContent = 'This is the updated content of the example file.';
updateFile(filePath, newContent);

// Example-4: Read the updated content of the file
readFile(filePath);

// Example-5: Delete the file
deleteFile(filePath);

// Create person objects and store them in an array
const persons = [
    { name: 'Alice', age: 30, city: 'New York' },
    { name: 'Bob', age: 25, city: 'Los Angeles' },
    { name: 'Charlie', age: 35, city: 'Chicago' }
];

// write the person objects to a JSON file
const jsonFilePath = 'persons.json';
const jsonContent = JSON.stringify(persons, null, 2);
createFile(jsonFilePath, jsonContent);

// read the content of the JSON file
readFile(jsonFilePath);

// Add more person objects to the array
persons.push({ name: 'David', age: 28, city: 'Houston' });
persons.push({ name: 'Eve', age: 32, city: 'Phoenix' });

// Update the JSON file with the new person objects
const updatedJsonContent = JSON.stringify(persons, null, 2);
updateFile(jsonFilePath, updatedJsonContent);

