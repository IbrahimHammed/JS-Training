

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

    // example-10
    const generate10 = document.getElementById('btnGenerate10');
    const inputElement10 = document.getElementById('txtNumberInput10');
    const resultElement10 = document.getElementById('txtNumberOutput10');

    // example-11
    const generate11 = document.getElementById('btnGenerate11');
    const resultElement11 = document.getElementById('txtNumber11');

    // Example-12
    const generate12 = document.getElementById('btnGenerate12');
    const resultElement12 = document.getElementById('txtNumber12');

    // Example-13
    const generate13 = document.getElementById('btnGenerate13');
    const resultElement13 = document.getElementById('txtNumber13');

    // Example-14
    const generate14 = document.getElementById('btnGenerate14');
    const resultElement14 = document.getElementById('txtNumber14');

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

    // Example-10
    // Generates a random number between 1 and 10 and compare it with the numeric equivalent of user input
    function generateRandomNumberExample10() {
        const randomNumber = Math.floor(Math.random() * 10) + 1;
        resultElement10.value = randomNumber;
        let userInputEquivalent;

        // Convert user input text to number e.g. one is 1, two is 2
        switch (inputElement10.value.toLowerCase()) {
            case 'one':
                userInputEquivalent = 1;
                break;
            case 'two':
                userInputEquivalent = 2;
                break;
            case 'three':
                userInputEquivalent = 3;
                break;
            case 'four':
                userInputEquivalent = 4;
                break;
            case 'five':
                userInputEquivalent = 5;
                break;
            case 'six':
                userInputEquivalent = 6;
                break;
            case 'seven':
                userInputEquivalent = 7;
                break;
            case 'eight':
                userInputEquivalent = 8;
                break;
            case 'nine':
                userInputEquivalent = 9;
                break;
            case 'ten':
                userInputEquivalent = 10;
                break;
            default:
                alert('Please enter a valid number between 1 and 10 (e.g., one, two, three, etc.)');
                return;
        }

        if (userInputEquivalent === randomNumber) {
            alert('Congratulations! You guessed the correct number.');
        } else {
            alert(`Sorry, the correct number was ${randomNumber}. Try again!`);
        }
    }

    // Example-11
    // Generates a random number between 5 and 10
    function generateRandomNumberExample11() {
        const startNumber = 5;
        const endNumber = 10;

        const randomNumber = Math.floor(Math.random() * (endNumber - startNumber + 1)) + startNumber;
        resultElement11.value = randomNumber;
    }

    // Example-12
    // Generates a random number between 11 and 25
    function generateRandomNumberExample12() {
        const startNumber = 11;
        const endNumber = 25;

        const randomNumber = Math.floor(Math.random() * (endNumber - startNumber + 1)) + startNumber;
        resultElement12.value = randomNumber;
    }

    // Example-13
    // Generates a random number between -5 and 5
    function generateRandomNumberExample13() {
        const startNumber = -5;
        const endNumber = 5;

        const randomNumber = Math.floor(Math.random() * (endNumber - startNumber + 1)) + startNumber;
        resultElement13.value = randomNumber;
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

    // Example-10
    generate10.addEventListener('click', generateRandomNumberExample10);

    // Example-11
    generate11.addEventListener('click', generateRandomNumberExample11);

    // Example-12
    generate12.addEventListener('click', generateRandomNumberExample12);

    // Example-13
    generate13.addEventListener('click', generateRandomNumberExample13);