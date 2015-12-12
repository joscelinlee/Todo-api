var cryptojs = require('crypto-js');

module.exports = function(db) { // db is the database
	return {
		// define any middlewares that we want to use in the app
		requireAuthentication : function(req, res, next) {
			// never call 'next', private code is not going to run
			var token = req.get('Auth') || ''; // if token does not exist, set it as empty string so that the MD5 code below won't fail

			db.token.findOne({
				where: {
					tokenHash: cryptojs.MD5(token).toString()
				}
			}).then(function(tokenInstance) {
				if (!tokenInstance) {
					throw new Error();
				}

				req.token = tokenInstance; // store it in request object
				return db.user.findByToken(token); // keep the chain alive
			}).then(function(user) { 
				req.user = user; // 'req.user' can access the sequelize instance
				next(); // continue to private code
			}).catch(function() { // by throwing an error, catch will be called
				res.status(401).send();
			});
			// db.user.findByToken(token).then(function(user) { // 'findByToken' is a custom method
			// 	req.user = user; // 'req.user' can access the sequelize instance
			// 	next(); // continue to private code
			// }, function(e) {
			// 	res.status(401).send();
			// });
		}
	};
};