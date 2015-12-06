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
	var matchedTodo = _.findWhere(todos, {id: todoID});

	if (matchedTodo) {
		res.json(matchedTodo); // send back json data
	} else {
		res.status(404).send(); // call this if there is no match
	}

	// res.send('Asking for todo with id of ' + req.params.id); // params is short for url parameters (e.g. :id);
});

// POST different from GET as POST can take data. POST /todos
app.post('/todos', function(req, res) {
	//var body = req.body;
	var body = _.pick(req.body, 'description', 'completed');// the second argument and onwards are things provided by user that we want to keep
	
	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) { // if body.completed is not a boolean OR body.description is not a string OR string is nothing but spaces OR string is simply empty string. Trim removes spaces before and after the string.
		return res.status(400).send(); // bad data or some data not provided
	}

	body.description = body.description.trim(); // Get rid of any spaces before and after

	// add id field. 
	body.id = todoNextId;
	todoNextId++;

	// push body into array
	todos.push(body);
	// console.log('description: ' + body.description);

	res.json(body);
});

// DELETE is a http method. DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
	var todoID = parseInt(req.params.id, 10); // req.params.id is a string, hence convert string to int
	var matchedTodo = _.findWhere(todos, {id: todoID}); // return json
	 
	if (!matchedTodo) {
		res.status(404).json({"error": "no todo found with that id"});
	} else {
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo); // by default the json method sets a http status of 200
	}
});

// PUT is a http method. PUT /todos/:id
app.put('/todos/:id', function(req, res) {
	var todoID = parseInt(req.params.id, 10); 
	var matchedTodo = _.findWhere(todos, {id: todoID}); 
	var body = _.pick(req.body, 'description', 'completed'); // returns json
	var validAttributes = {}; // an object that stores values that we want to update

	if (!matchedTodo) {
		return res.status(404).send(); // 'return' will exit this function and the code below won't run
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) { // 'hasOwnProperty' checks that property 'completed' exists. If it has the the property 'completed' and validate if the property is a boolean.
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) { // property exists but not boolean
		return res.status(400).send();
	} else {
		// Never provided attributes, no problem here
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}

	// Pass validation check and now updating functions go here
	// matchedTodo = _.extend(matchedTodo, validAttributes); // First (destination) argument is the original destination object. Second (source) argument is the object you want to use to overwrite the properties.
	_.extend(matchedTodo, validAttributes);
	res.json(matchedTodo); // automatically sends status 200
});

app.listen(PORT, function() {
	console.log('Express listening on port ' + PORT + '!');
});