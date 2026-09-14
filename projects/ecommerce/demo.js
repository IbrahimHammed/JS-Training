// Get firstname and age from demo.html and greet the user when submit button is clicked
document.querySelector("form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission

    let firstname = document.getElementById("firstname").value;
    let age = parseInt(document.getElementById("age").value);

    alert(`Hello ${firstname}, you are ${age} years old!`);
});