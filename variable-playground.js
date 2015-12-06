// var person = {
// 	name: 'Andrew',
// 	age: 21
// };

// function updatePerson(obj) {
// 	// Not updating the original
// 	// obj = {
// 	// 	name: 'Andrew',
// 	// 	age: 24
// 	// }
// 	obj.age = 24; // Updating the original as you call something on the original.
// }

// updatePerson(person);
// console.log(person);

// Array Example
var grades = [15, 88];

function addGrades(gradesArr) {
	gradesArr.push(55);
	debugger; 
	// gradesArr = [12, 33, 99];
}

addGrades(grades);
console.log(grades);