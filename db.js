var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development'; // process.env is an object that has key-value pair
var sequelize; 

if (env === 'production') { // Only true if is running on heroku. Connect to postgres database on heroku.
	sequelize = new Sequelize(process.env.DATABASE_URL, {
		dialect: 'postgres'
	});
} else { // Runs when not on production
	sequelize = new Sequelize(undefined, undefined, undefined, { 
		'dialect': 'sqlite',
		'storage': __dirname + '/data/dev-todo-api.sqlite'
	});
}

// var sequelize = new Sequelize(undefined, undefined, undefined, { 
// 	'dialect': 'sqlite',
// 	'storage': __dirname + '/data/dev-todo-api.sqlite'
// }); // A variable that stores an instance of Sequelize. An instance is a creation out of a blueprint.

var db = {}; // create a new object called db. 

db.todo = sequelize.import(__dirname + '/models/todo.js'); // Load sequelize model from separate file. 'todo' property of 'db' object
db.user = sequelize.import(__dirname + '/models/user.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db; // Set it to object to return multiple things from a file. Export db object, which has todo model, sequelize instance and Sequelize library.