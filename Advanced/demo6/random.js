

    // Step-1: Create object references to the button and input field
    // Example-1
    const generate1 = document.getElementById('btnGenerate1');
    const resultElement1 = document.getElementById('txtNumber1');

    // Example-2
    const generate2 = document.getElementById('btnGenerate2');
    const resultElement2 = document.getElementById('txtNumber2');

    // Example-3
    const generate3 = document.getElementById('btnGenerate3');
    const resultElement3 = document.getElementById('txtNumber3');

    // Example-4
    const generate4 = document.getElementById('btnGenerate4');
    const resultElement4 = document.getElementById('txtNumber4');

    // Example-5
    const generate5 = document.getElementById('btnGenerate5');
    const resultElement5 = document.getElementById('txtNumber5');

    // Example-6
    const generate6 = document.getElementById('btnGenerate6');
    const resultElement6 = document.getElementById('txtNumber6');

    // Example-7
    const generate7 = document.getElementById('btnGenerate7');
    const resultElement7 = document.getElementById('txtNumber7');

    // Example-8
    const generate8 = document.getElementById('btnGenerate8');
    const resultElement8 = document.getElementById('txtNumber8');

    // example-9
    const generate9 = document.getElementById('btnGenerate9');
    const resultElement9 = document.getElementById('txtNumber9');


    // Step-2: Create a function to generate a random number and display it in the input field
    // Example-1
    // Generates random numbers between 0 and 1
    function generateRandomNumberExample1() {
        const randomNumber = Math.random();
        resultElement1.value = randomNumber;
    }

    // Example-2
    // Generates random numbers between 0 and 10
    function generateRandomNumberExample2() {
        const randomNumber = Math.random() * 10;
        resultElement2.value = randomNumber;
    }

    // Example-3
    // Generates random numbers between 0 and 100
    function generateRandomNumberExample3() {
        const randomNumber = Math.random() * 100;
        resultElement3.value = randomNumber;
    }

    // Example-4
    // Generates random numbers between 0 and 1000
    function generateRandomNumberExample4() {
        const randomNumber = Math.random() * 1000;
        resultElement4.value = randomNumber;
    }

    // Example-5
    // Generates random numbers between 0 and 10 without decimal places
    function generateRandomNumberExample5() {
        // Step-1: Generate a random number between 0 and 1
        // const randomNumber = Math.floor(Math.random() * 10);
        let randomNumber = Math.random();

        // Step-2: Scale the random number to the desired range (0 to 10) and round it down to the nearest integer
        randomNumber = randomNumber * 10;

        // Step-3: Round the random number down to the nearest integer
        randomNumber = Math.floor(randomNumber) + 1;

        // Step-4: Display the random number in the input field
        resultElement5.value = randomNumber;
    }

    // Example-6
    // Generates random numbers between 0 and 100 without decimal places
    function generateRandomNumberExample6() {
        const randomNumber = Math.floor(Math.random() * 100) + 1;
        resultElement6.value = randomNumber;
    }

    // Example-7
    // Generates random numbers between 0 and 1000 without decimal places
    function generateRandomNumberExample7() {
        const randomNumber = Math.floor(Math.random() * 1000) + 1;
        resultElement7.value = randomNumber;
    }

    // Example-8
    // Generates random numbers between 1 and 10
    function generateRandomNumberExample8() {
        const randomNumber = Math.floor(Math.random() * 10) + 1;
        resultElement8.value = randomNumber;
    }

    // Example-9
    // Generates random numbers between 1 and 100
    function generateRandomNumberExample9() {
        const randomNumber = Math.floor(Math.random() * 100) + 1;
        resultElement9.value = randomNumber;
    }

    // Step-3: Create and attach event listener to the button
    // Example-1
    generate1.addEventListener('click', generateRandomNumberExample1);

    // Example-2
    generate2.addEventListener('click', generateRandomNumberExample2);

    // Example-3
    generate3.addEventListener('click', generateRandomNumberExample3);

    // Example-4
    generate4.addEventListener('click', generateRandomNumberExample4);

    // Example-5
    generate5.addEventListener('click', generateRandomNumberExample5);

    // Example-6
    generate6.addEventListener('click', generateRandomNumberExample6);

    // Example-7
    generate7.addEventListener('click', generateRandomNumberExample7);

    // Example-8
    generate8.addEventListener('click', generateRandomNumberExample8);

    // Example-9
    generate9.addEventListener('click', generateRandomNumberExample9);