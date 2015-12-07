var express = require('express');
var bodyParser = require('body-parser');// new middleware
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1; // elminate this when we used database. To keep track locally.

app.use(bodyParser.json()); // set up middleware

app.get('/', function(req, res) {
	res.send('Todo API Root');
});

// GET /todos
app.get('/todos', function(req, res) {
	res.json(todos); // todos array is converted to json and send back to whoever call the api
});
// GET /todos/:id --> /todos/2
app.get('/todos/:id', function(req, res) {
	var todoID = parseInt(req.params.id, 10); // req.params.id is a string, hence convert string to int
	var matchedTodo; // no value set means undefined

	// iterate array to find match
	todos.forEach(function(todo) {
		if (todoID === todo.id) {
			matchedTodo = todo;
		}
	});

	if (matchedTodo) {
		res.json(matchedTodo); // send back json data
	} else {
		res.status(404).send(); // call this if there is no match
	}

	// res.send('Asking for todo with id of ' + req.params.id); // params is short for url parameters (e.g. :id);
});

// POST different from GET as POST can take data. POST /todos
app.post('/todos', function(req, res) {
	var body = req.body;

	// add id field. 
	body.id = todoNextId;
	todoNextId++;

	// push body into array
	todos.push(body);
	// console.log('description: ' + body.description);

	res.json(body);
});

app.listen(PORT, function() {
	console.log('Express listening on port ' + PORT + '!');
});