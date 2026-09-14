// Array containing all possible prize names for each winning position
const prizeNames = ["Coca Cola", "Crush", "Fanta", "Sprite", "Pepsi"];

// Add click event listener to the "Play" button
document.getElementById("playBtn").addEventListener("click", function () {
    // Get the user's selected number and convert it to an integer
    const userNum = parseInt(document.getElementById("userNumber").value);
    
    // Get reference to the message display element
    const message = document.getElementById("message");

    // Validate that user entered a number between 1 and 5
    // if (!userNum || userNum < 1 || userNum > 5) {
    //     message.textContent = "Please enter a valid number between 1 and 5.";
    //     return;
    // }

    // If the input is not a number, display an alert message
    if (isNaN(userNum)) {
        message.textContent = "Alert! A number is required between 1 and 5.";
        return;
    }

    // If the input is a negative number, display an alert message
    if (userNum < 0 ) {
        message.textContent = "Alert! Input can't be negative. Please enter a number between 1 and 5.";
        return;
    }

    // If input is zero, display an alert message
    if (userNum === 0) {
        message.textContent = "Alert! Input can't be zero. Please enter a number between 1 and 5.";
        return;
    }

    // If input is greater than 5, display an alert message
    if (userNum > 5) {
        message.textContent = "Alert! Input can't be greater than 5. Please enter a number between 1 and 5.";
        return;
    }

    // Clear any previous message
    message.textContent = "";

    // Get references to all 5 number display cells
    const numCells = [
        document.getElementById("num1"),
        document.getElementById("num2"),
        document.getElementById("num3"),
        document.getElementById("num4"),
        document.getElementById("num5")
    ];

    // Array to store the final numbers that will settle in each cell (index 0–4 corresponds to columns 1–5)
    const finalNumbers = new Array(5);
    
    // Counter to track how many cells have finished spinning
    let settledCount = 0;

    // Loop through each cell and create a spinning animation
    numCells.forEach((cell, index) => {
        // Generate a random number of spins (between 20 and 40) to make duration unpredictable
        let spins = 20 + Math.floor(Math.random() * 20);

        // Set up interval to rapidly change the displayed number every 80 milliseconds
        let interval = setInterval(() => {
            // Generate a random number between 1 and 10 and display it in the cell
            cell.textContent = Math.floor(Math.random() * 10) + 1;
        },80);

        // After the spinning animation is complete, set the final number
        setTimeout(() => {
            // Stop the spinning animation
            clearInterval(interval);
            
            // Generate and display the final settled number (1-10)
            let finalNum = Math.floor(Math.random() * 10) + 1;
            cell.textContent = finalNum;

            // Store the final number in the array for later comparison
            finalNumbers[index] = finalNum;
            
            // Increment the counter of settled cells
            settledCount++;

            // Once all 5 cells have settled, check if the user won
            if (settledCount === 5) {
                checkWin(userNum, finalNumbers);
            }
        }, spins * 80);
    });
});


// Function to check if the user won and display results
function checkWin(userNum, finalNumbers) {
    // Get reference to the message display element
    const message = document.getElementById("message");
    
    // Array to store the positions (1-5) where the user's number matched
    let hitPositions = [];

    // Loop through all final numbers to find matches with the user's selected number
    finalNumbers.forEach((num, idx) => {
        if (num === userNum) {
            // Store the 1-based position (convert from 0-based index)
            hitPositions.push(idx + 1);
        }
    });

    // Check if there are any winning matches
    if (hitPositions.length > 0) {
        // Get the prize names corresponding to each winning position
        const wonPrizes = hitPositions.map(pos => prizeNames[pos - 1]).join(", ");

        // Display congratulations message with the won prizes
        message.textContent = `🎉 Congratulations! You won: ${wonPrizes}! 🎉`;

        // Apply blinking animation to each winning prize image
        hitPositions.forEach(pos => {
            // Get the image element corresponding to the winning position
            const img = document.getElementById("img" + pos);
            
            // Add the 'blink' CSS class to trigger the animation
            img.classList.add("blink");
            
            // Remove the 'blink' class after 3 seconds to stop the animation
            setTimeout(() => img.classList.remove("blink"), 3000);
        });

    } else {
        // If no matches, display a "try again" message
        message.textContent = "Sorry, try again!";
    }
}

