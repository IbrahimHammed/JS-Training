
// 1: function to multiply qty by price to get the amount
const calculateAmount = (qty, price) => {
    return qty * price;
}

let price = parseFloat(prompt("Enter the price of the item: "));
let qty = parseInt(prompt("Enter the quantity of the item: "));
let amount = calculateAmount(qty, price);
console.log(`The total amount for ${qty} items at $${price} each is: $${amount.toFixed(2)}`);

function getVATAmount(amount, vatRate = 0.10) {
    return amount * vatRate;
}

// 2: function to calculate the total amount after VAT (10%) and discount (5%) if amount is greater than 1000
const getTotalAmountWithVAT = (amount) => {
    const discountRate = 0.05;
    const vatRate = 0.10;

    if (amount > 1000) {
        // calculate discount if amount is greater than 1000
        const discount = amount * discountRate;

        // calculate the discounted amount
        const discountedAmount = amount - discount;

        // calculate the VAT on the discounted amount
        const vat = getVATAmount(discountedAmount, vatRate);

        // return the total amount after applying discount and adding VAT
        return discountedAmount + vat;
    } else {
        // When there is no discount, calculate the VAT on the original amount and return the total amount
        let vat = getVATAmount(amount, vatRate);
        let totalAmount = amount + vat;

        return totalAmount;
    }
};

// 3: function to display the area of a circle given the radius
const getCircleArea = (radius) => {
    return Math.PI * radius ** 2;
};

let radius = parseFloat(prompt("Enter the radius of the circle: "));
let circleArea = getCircleArea(radius);
console.log(`The area of the circle with radius ${radius} is: ${circleArea.toFixed(2)}`);


// 4: function to display the area of a rectangle given the length and width
const getRectangleArea = (length, width) => {
    return length * width;
};

let length = parseFloat(prompt("Enter the length of the rectangle: "));
let width = parseFloat(prompt("Enter the width of the rectangle: "));

let rectangleArea = getRectangleArea(length, width);

console.log(`The area of the rectangle with length ${length} and width ${width} is: ${rectangleArea.toFixed(2)}`);


// 5: function to display the grade of a student given the score (A, B, C, D, E, F)
const getGrade = (score) => {
    if (score >= 80) {
        return 'A';
    } else if (score >= 70) {
        return 'B';
    } else if (score >= 60) {
        return 'C';
    } else if (score >= 50) {
        return 'D';
    } else if (score >= 40) {
        return 'E';
    } else {
        return 'F';
    }
};

let score = parseFloat(prompt("Enter the score of the student: "));
let grade = getGrade(score);
console.log(`The grade for the score ${score} is: ${grade}`);