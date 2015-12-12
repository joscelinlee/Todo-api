module.exports = function(db) { // db is the database
	return {
		// define any middlewares that we want to use in the app
		requireAuthentication : function(req, res, next) {
			// never call 'next', private code is not going to run
			var token = req.get('Auth');

			db.user.findByToken(token).then(function(user) { // 'findByToken' is a custom method
				req.user = user;
				next(); // continue to private code
			}, function(e) {
				res.status(401).send();
			});
		}
	};
};