// This the js logic for the calculator project

// Get references to the input fields and buttons
// Result display field
const result = document.getElementById('result');

// Operator buttons
const btnClear = document.getElementById('btnClear');
const btnAdd = document.getElementById('btnAdd');
const btnSubtract = document.getElementById('btnSubtract');
const btnMultiply = document.getElementById('btnMultiply');
const btnDivide = document.getElementById('btnDivide');
const btnEqual = document.getElementById('btnEqual');
const btnDecimal = document.getElementById('btnDecimal');
const btnPower = document.getElementById('btnPower');

// Get references to the number buttons
const btn0 = document.getElementById('btn0');
const btn1 = document.getElementById('btn1');
const btn2 = document.getElementById('btn2');
const btn3 = document.getElementById('btn3');
const btn4 = document.getElementById('btn4');
const btn5 = document.getElementById('btn5');
const btn6 = document.getElementById('btn6');
const btn7 = document.getElementById('btn7');
const btn8 = document.getElementById('btn8');
const btn9 = document.getElementById('btn9');

// Generic function to append a value to the display
function appendToDisplay(value) {
    // This appends the given value to the result display field
    // This is cruicial for the calculator to work as it allows the user 
    // to build up an expression to be evaluated
    result.value += value;
}

// Event listeners for number buttons
btn0.addEventListener('click', () => appendToDisplay('0'));
btn1.addEventListener('click', () => appendToDisplay('1')); 
btn2.addEventListener('click', () => appendToDisplay('2'));
btn3.addEventListener('click', () => appendToDisplay('3'));
btn4.addEventListener('click', () => appendToDisplay('4'));
btn5.addEventListener('click', () => appendToDisplay('5'));
btn6.addEventListener('click', () => appendToDisplay('6'));
btn7.addEventListener('click', () => appendToDisplay('7'));
btn8.addEventListener('click', () => appendToDisplay('8'));
btn9.addEventListener('click', () => appendToDisplay('9'));

// Event listeners for operator buttons
btnAdd.addEventListener('click', () => appendToDisplay('+'));
btnSubtract.addEventListener('click', () => appendToDisplay('-'));
btnMultiply.addEventListener('click', () => appendToDisplay('*'));
btnDivide.addEventListener('click', () => appendToDisplay('/'));
btnDecimal.addEventListener('click', () => appendToDisplay('.'));
btnPower.addEventListener('click', () => appendToDisplay('**'));
btnClear.addEventListener('click', () => {
    result.value = '';
});


// Event listener for equal button
btnEqual.addEventListener('click', () => {
    try {
        // Evaluate the expression in the display
        const evaluation = eval(result.value);
        
        // Update the display with the result
        result.value = evaluation;
    }
    catch (error) {
        // If there's an error in the expression, display an error message
        result.value = 'Error';
    }
});
