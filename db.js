var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, { 
	'dialect': 'sqlite',
	'storage': __dirname + '/data/dev-todo-api.sqlite'
}); // A variable that stores an instance of Sequelize. An instance is a creation out of a blueprint.

var db = {}; // create a new object called db. 

db.todo = sequelize.import(__dirname + '/models/todo.js'); // Load sequelize model from separate file. 'todo' property of 'db' object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db; // Set it to object to return multiple things from a file. Export db object, which has todo model, sequelize instance and Sequelize library.