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

var User = sequelize.define('user', {
	email: Sequelize.STRING
});

// By calling the two methods, sequelize knows how to set up foreign keys in database
Todo.belongsTo(User); 
User.hasMany(Todo);

sequelize.sync({
	// force: true
}).then(function() { 
	console.log('Everything is synced');

	User.findById(1).then(function(user) {
		user.getTodos({
			where: {
				completed: false
			}
		}).then(function(todos) {
			todos.forEach(function(todo) {
				console.log(todo.toJSON());
			});
		});
	});
	// User.create({
	// 	email: 'andrew@example.com'
	// }).then(function() {
	// 	return Todo.create({
	// 		description: 'Clean yard'
	// 	});
	// }).then(function(todo) { // get user and todo instance
	// 	User.findById(1).then(function(user) {
	// 		user.addTodo(todo);
	// 	});
	// });

});