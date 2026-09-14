// Here's the js logic for the calculator

// Get references to the input fields and buttons
const btn1 = document.getElementById('btn1');
const btn2 = document.getElementById('btn2');
const btn3 = document.getElementById('btn3');
const btn4 = document.getElementById('btn4');
const btn5 = document.getElementById('btn5');
const btn6 = document.getElementById('btn6');
const btn7 = document.getElementById('btn7');
const btn8 = document.getElementById('btn8');
const btn9 = document.getElementById('btn9');
const btn0 = document.getElementById('btn0');

const btnAdd = document.getElementById('btnAdd');
const btnSubtract = document.getElementById('btnSubtract');
const btnMultiply = document.getElementById('btnMultiply');
const btnDivide = document.getElementById('btnDivide');
const btnEqual = document.getElementById('btnEqual');
const btnClear = document.getElementById('btnClear');
const btnDecimal = document.getElementById('btnDecimal');
const btnPower = document.getElementById('btnPower');

// Get reference to the display field
const display = document.getElementById('result');

// Generic function to append a value to the display
function appendToDisplay(value) {
    display.value += value;
}

// Event listeners for number buttons
btn1.addEventListener('click', () => appendToDisplay('1'));
btn2.addEventListener('click', () => appendToDisplay('2'));
btn3.addEventListener('click', () => appendToDisplay('3'));
btn4.addEventListener('click', () => appendToDisplay('4'));
btn5.addEventListener('click', () => appendToDisplay('5'));
btn6.addEventListener('click', () => appendToDisplay('6'));
btn7.addEventListener('click', () => appendToDisplay('7'));
btn8.addEventListener('click', () => appendToDisplay('8'));
btn9.addEventListener('click', () => appendToDisplay('9'));
btn0.addEventListener('click', () => appendToDisplay('0'));

// Event listeners for operator buttons
btnAdd.addEventListener('click', () => appendToDisplay('+'));
btnSubtract.addEventListener('click', () => appendToDisplay('-'));
btnMultiply.addEventListener('click', () => appendToDisplay('*'));
btnDivide.addEventListener('click', () => appendToDisplay('/'));
btnDecimal.addEventListener('click', () => appendToDisplay('.'));
btnPower.addEventListener('click', () => appendToDisplay('**'));


// Event listener for equal button
btnEqual.addEventListener('click', () => {
    try {
        // Evaluate the expression in the display
        const result = eval(display.value);

        // Update the display with the result
        display.value = result;
    } catch (error) {

        // If there's an error in the expression, display an error message
        display.value = 'Error';
    }
});


// Event listener for clear button
btnClear.addEventListener('click', () => {
    // Clear the display
    display.value = '';
});

