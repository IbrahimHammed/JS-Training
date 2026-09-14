const prompt = require('prompt-sync')();

// let employees = [
//     { name: 'Alice', oldSalary: 50000, salaryIncrement: 0, performanceRating: 5, newSalary: 0 },
//     { name: 'Bob', oldSalary: 45000, salaryIncrement: 0, performanceRating: 4, newSalary: 0 },
//     { name: 'Charlie', oldSalary: 40000, salaryIncrement: 0, performanceRating: 3, newSalary: 0 },
//     { name: 'David', oldSalary: 35000, salaryIncrement: 0, performanceRating: 2, newSalary: 0 },
//     { name: 'Eve', oldSalary: 30000, salaryIncrement: 0, performanceRating: 1, newSalary: 0 },
//     { name: 'Frank', oldSalary: 55000, salaryIncrement: 0, performanceRating: 5, newSalary: 0 },
//     { name: 'Grace', oldSalary: 48000, salaryIncrement: 0, performanceRating: 4, newSalary: 0 },
//     { name: 'Heidi', oldSalary: 42000, salaryIncrement: 0, performanceRating: 3, newSalary: 0 },
//     { name: 'Ivan', oldSalary: 37000, salaryIncrement: 0, performanceRating: 2, newSalary: 0 },
//     { name: 'Judy', oldSalary: 32000, salaryIncrement: 0, performanceRating: 1, newSalary: 0 }
// ];

// // Salary update based on performance rating
// // 5% increase for rating of 5
// // 3% increase for rating of 4
// // 1% increase for rating of 3
// // No increase for rating of 2 or below
 for (let i = 0; i < employees.length; i++) {
    let employee = employees[i];
    let incrementPercentage = 0;
    if (employee.performanceRating === 5) {
        incrementPercentage = 0.05;
    }
    else if (employee.performanceRating === 4) {
        incrementPercentage = 0.03;
    }
    else if (employee.performanceRating === 3) {
        incrementPercentage = 0.01;
    }
    employee.salaryIncrement = employee.oldSalary * incrementPercentage;
    employee.newSalary = employee.oldSalary + employee.salaryIncrement;
 }

// //  Option-1: Print employee salary updates in a formatted manner
// //  console.log('Employee Salary Updates:');
 for (let i = 0; i < employees.length; i++) {
    let employee = employees[i];
    console.log(`${employee.name}: Old Salary: $${employee.oldSalary.toFixed(2)}, Increment: $${employee.salaryIncrement.toFixed(2)}, New Salary: $${employee.newSalary.toFixed(2)}`);
 }

// // Option-2
// console.log(employees);

let maxNumber = parseInt(prompt('Enter the maximum number to print: '));

for (let i = 1; i <= maxNumber; i++) {
    console.log(`Iteration ${i}`);
}