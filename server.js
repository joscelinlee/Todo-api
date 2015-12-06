var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

// todos is a model. Collection consists of many models. A model is just one unit.
var todos = [{
	id: 1,
	description: 'Meet mom for lunch',
	completed: false
}, {
	id: 2,
	description: 'Go to market',
	completed: false
}, {
	id: 3,
	description: 'Feed the cat',
	completed: true
}];

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

	//res.send('Asking for todo with id of ' + req.params.id); // params is short for url parameters (e.g. :id);
});

app.listen(PORT, function() {
	console.log('Express listening on port ' + PORT + '!');
});