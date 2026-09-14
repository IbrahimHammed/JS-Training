// This code defines a function called divideNumbers that retrieves values from two input fields, converts them to numbers, calculates their quotient, and displays the result in an HTML element with the id "result". It also adds an event listener to a button with the id "divideButton" that triggers the divideNumbers function when clicked.
function addNumbers(num1, num2){
    // Get the values from the input fields
    let number1 = document.getElementById("num1").value;
    let number2 = document.getElementById("num2").value;

    // Convert the input values to numbers and calculate the sum
    let sum = parseFloat(number1) + parseFloat(number2);

    // Display the result in the HTML element with id "result"
    document.getElementById("result").innerHTML = "The sum is: " + sum;
}

// This code adds an event listener to the button with id "addButton". When the button is clicked, it calls the addNumbers function, which retrieves the values from the input fields, converts them to numbers, calculates their sum, and displays the result in the HTML element with id "result".    
const addButton = document.getElementById("addButton");
addButton.addEventListener("click", addNumbers);


// This code handles the subtraction of two numbers. It retrieves the values from the input fields, converts them to numbers, calculates their difference, and displays the result in the HTML element with id "result". It also adds an event listener to the button with id "subtractButton" to trigger the subtraction operation when clicked.
function subtractNumbers(num1, num2){
    // Get the values from the input fields
    let number1 = document.getElementById("num1").value;
    let number2 = document.getElementById("num2").value;

    // Convert the input values to numbers and calculate the difference
    let difference = parseFloat(number1) - parseFloat(number2);

    // Display the result in the HTML element with id "result"
    document.getElementById("result").innerHTML = "The difference is: " + difference;
}

const subtractButton = document.getElementById("subtractButton");
subtractButton.addEventListener("click", subtractNumbers);


//  This code handles the multiplication of two numbers. It retrieves the values from the input fields, converts them to numbers, calculates their product, and displays the result in the HTML element with id "result".
function multiplyNumbers(num1, num2){
    // Get the values from the input fields
    let number1 = document.getElementById("num1").value;
    let number2 = document.getElementById("num2").value;

    // Convert the input values to numbers and calculate the product
    let product = parseFloat(number1) * parseFloat(number2);

    // Display the result in the HTML element with id "result"
    document.getElementById("result").innerHTML = "The product is: " + product;
}

const multiplyButton = document.getElementById("multiplyButton");
multiplyButton.addEventListener("click", multiplyNumbers);


//  This code handles the division of two numbers. It retrieves the values from the input fields, converts them to numbers, calculates their quotient, and displays the result in the HTML element with id "result". It also adds an event listener to the button with id "divideButton" to trigger the division operation when clicked.
function divideNumbers(num1, num2){
    // Get the values from the input fields
    let number1 = document.getElementById("num1").value;
    let number2 = document.getElementById("num2").value;

    // Convert the input values to numbers and calculate the quotient
    let quotient = parseFloat(number1) / parseFloat(number2);

    // Display the result in the HTML element with id "result"
    document.getElementById("result").innerHTML = "The quotient is: " + quotient;
}

// This code adds an event listener to the button with id "divideButton". When the button is clicked, it calls the divideNumbers function, which retrieves the values from the input fields, converts them to numbers, calculates their quotient, and displays the result in the HTML element with id "result".
const divideButton = document.getElementById("divideButton");
divideButton.addEventListener("click", divideNumbers);