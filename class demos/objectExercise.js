const prompt = require('prompt-sync')();

// Create a collection of books  
let books = [];
let addMore = "yes";

// Collect books from user input with blank structure
while (addMore.toLowerCase() === "yes") {
    // Define a blank book object
    let book = {};
    
    // Prompt user for properties
    book.isbn = prompt("Enter ISBN: ");
    book.title = prompt("Enter title: ");
    book.author = prompt("Enter author: ");
    book.year = parseInt(prompt("Enter year: "));
    book.genre = prompt("Enter genre: ");
    book.pages = parseInt(prompt("Enter number of pages: "));
    book.available = prompt("Is the book available? (yes/no): ");
    
    // Add the book object to the array
    books.push(book);
    
    console.log();
    console.log("Book added successfully!");
    console.log(book);
    console.log();

    // Print the collection of books in tablular format
    console.table(books);
    
    console.log();
    addMore = prompt("Add another book? (yes/no): ");
    console.log();
}

