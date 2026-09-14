const generate = document.getElementById('btnGenerate');

// Add an event listener to the button to generate a random number when clicked
generate.addEventListener('click', () => {
    // const randomNumber = Math.floor(Math.random() * 100) + 1;
    
    // const randomNumber = Math.random();
    // const randomNumber = Math.random() * 10;
    const randomNumber = Math.random() * 100;
    
    const resultElement = document.getElementById('txtNumber');
    resultElement.value = randomNumber;
});