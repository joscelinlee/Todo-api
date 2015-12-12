var express = require('express');
var bodyParser = require('body-parser'); // new middleware
var _ = require('underscore');
var db = require('./db.js'); // access to databse
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1; // elminate this when we used database. To keep track locally.

app.use(bodyParser.json()); // set up middleware

app.get('/', function(req, res) {
	res.send('Todo API Root');
});

// GET /todos?completed=true&q=house --> return description that has 'house'
app.get('/todos', middleware.requireAuthentication, function(req, res) {
	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}

	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%' + query.q + '%'
		};
	}

	db.todo.findAll({where: where}).then(function(todos) {
		res.json(todos);
	}, function(e) {
		res.status(500).send();
	});

	// var queryParams = req.query;
	// var filteredTodos = todos;

	// if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
	// 	filteredTodos = _.where(filteredTodos, {
	// 		completed: true
	// 	});
	// } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
	// 	filteredTodos = _.where(filteredTodos, {
	// 		completed: false
	// 	});
	// }

	// if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
	// 	filteredTodos = _.filter(filteredTodos, function(todo) {
	// 		return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1; // return -1 if does not exist, else return position
	// 	});
	// }
	// //"Go to work on Saturday".indexOf('work'); // return -1 if does not exist, else return position
	// // res.json(todos); // todos array is converted to json and send back to whoever call the api
	// res.json(filteredTodos);
});

// GET /todos/:id --> /todos/2
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoID = parseInt(req.params.id, 10); // req.params.id is a string, hence convert string to int
	db.todo.findById(todoID).then(function(todo) {
		if (!!todo) { // Convert a non-boolean variable (can be object) to its truety version.
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}, function (e) {
		res.status(500).send();
	});

	// var matchedTodo = _.findWhere(todos, {
	// 	id: todoID
	// });

	// if (matchedTodo) {
	// 	res.json(matchedTodo); // send back json data
	// } else {
	// 	res.status(404).send(); // call this if there is no match
	// }

	// // res.send('Asking for todo with id of ' + req.params.id); // params is short for url parameters (e.g. :id);
});

// POST different from GET as POST can take data. POST /todos
app.post('/todos', middleware.requireAuthentication, function(req, res) {
	//var body = req.body;
	var body = _.pick(req.body, 'description', 'completed'); // the second argument and onwards are things provided by user that we want to keep

	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON()); // 'todo' is an object, which contains alot of sequlize methods on it. Need to convert to json first.
	}, function(e) {
		res.status(400).json(e);
	});

	// if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) { // if body.completed is not a boolean OR body.description is not a string OR string is nothing but spaces OR string is simply empty string. Trim removes spaces before and after the string.
	// 	return res.status(400).send(); // bad data or some data not provided
	// }

	// body.description = body.description.trim(); // Get rid of any spaces before and after

	// // add id field. 
	// body.id = todoNextId;
	// todoNextId++;

	// // push body into array
	// todos.push(body);
	// // console.log('description: ' + body.description);

	// res.json(body);
});

// DELETE is a http method. DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoID = parseInt(req.params.id, 10); // req.params.id is a string, hence convert string to int
	
	db.todo.destroy({ // If number is zero so assume id didn't exist.
		where: {
			id: todoID
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				error: 'No todo with id'
			});
		} else {
			res.status(204).send(); 
		}
	},function() {
		res.status(500).send();
	});

	// var matchedTodo = _.findWhere(todos, {
	// 	id: todoID
	// }); // return json

	// if (!matchedTodo) {
	// 	res.status(404).json({
	// 		"error": "no todo found with that id"
	// 	});
	// } else {
	// 	todos = _.without(todos, matchedTodo);
	// 	res.json(matchedTodo); // by default the json method sets a http status of 200
	// }
});

// PUT is a http method. PUT /todos/:id
// The above uses model methods. This uses instance methods, which execute on existing, already fetched model. Find a model with that id and when get instance back then call a method on it. 
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoID = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed'); // returns json
	var attributes = {}; // an object that stores values that we want to update

	if (body.hasOwnProperty('completed')) { // 'hasOwnProperty' checks that property 'completed' exists. If it has the the property 'completed' and validate if the property is a boolean.
		attributes.completed = body.completed;
	} 

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	} 

	db.todo.findById(todoID).then(function(todo) { // if findById() passes
		if (todo) {
			todo.update(attributes).then(function(todo) { // if todo.update() passes
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).json(e); // if todo.update() fails
			}); // keep moving the promise chain
		} else {
			res.status(404).send(); // resource is not found
		}
	}, function() { // if findById() fails
		res.status(500).send(); 
	});
});

app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function(user) {
		res.json(user.toPublicJSON()); // res.json(user.toJSON());
	}, function(e) {
		res.status(400).json(e);
	});
});

// POST /users/login (acting on users resource)
app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	// create a method on user model
	// create a class method. 'authenticate' is a custom method, not built in in sequelize.
	db.user.authenticate(body).then(function(user) { // 'authenticate' returns a promise. If authentication went well, get user back.
		var token = user.generateToken('authentication'); // chance that it return undefined

		if (token) { // check if token is defined
			res.header('Auth', token).json(user.toPublicJSON()); // first argument is key, second argument is the value
		} else {
			res.status(401).send();
		}

	}, function(e) {
		res.status(401).send();
	});
});

db.sequelize.sync({force: true}).then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});

