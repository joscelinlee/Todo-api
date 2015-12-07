var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, { 
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlite'
}); // A variable that stores an instance of Sequelize. An instance is a creation out of a blueprint.

var Todo = sequelize.define('todo', { // first argument is model name, second argument is attributes configuration
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			//notEmpty: true // Prevent empty string from being added. Cannot be empty string.
			len: [1, 250] // 1<=x<=250
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
});


sequelize.sync({
	//force: true
}).then(function() { 
	console.log('Everything is synced');

	Todo.findById(3).then(function(todo) {
		if (todo) {
			console.log(todo.toJSON());
		} else {
			console.log('Todo not found');
		}
	});

	// Todo.create({
	// 	description: 'Take out trash',
	// 	completed: false
	// }).then(function(todo) {
	// 	return Todo.create({
	// 		description: 'Clean office'
	// 	});
	// }).then(function() {
	// 	// return Todo.findById(1);
	// 	return Todo.findAll({
	// 		where: {
	// 			description: {
	// 				$like: '%Office%' // search for various words or phrases, capitalization is not an issue
	// 			}
	// 			//completed: false
	// 		}
	// 	});
	// }).then(function(todos) {
	// 	if (todos) {
	// 		todos.forEach(function(todo) {
	// 			console.log(todo.toJSON());
	// 		})
	// 	} else {
	// 		console.log('no todo found!');
	// 	}
	// }).catch(function(e) {
	// 	console.log(e);
	// });
});