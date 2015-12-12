var bcrypt = require('bcrypt'); // specify module name
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes) {
	var user = sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},
		salt: { // When you are hashing data, you will get the same result everytime, which is why salt is being added. Add a random set of chracters at the end of the plain text password before hashed. So end hashed will be different.
			type: DataTypes.STRING
		},
		password_hash: {
			type: DataTypes.STRING
		},
		password: {
			type: DataTypes.VIRTUAL, // virtual datatype, not stored in database but still accesible.
			allowNull: false,
			validate: {
				len: [7, 100]
			},
			set: function(value) { // 'value' is the password
				var salt = bcrypt.genSaltSync(10); // number of characters you want for your salt
				var hashedPassword = bcrypt.hashSync(value, salt);

				this.setDataValue('password', value); // not stored in database since it's virtual datatype
				this.setDataValue('salt', salt); // stored in database
				this.setDataValue('password_hash', hashedPassword);
			}
		}
	}, {
		hooks: {
			beforeValidate: function(user, options) { // sanitized the inputs given by user. This is run right before validation occurs.
				if (typeof user.email === 'string') {
					user.email = user.email.toLowerCase();
				}
			}
		},
		classMethods: {
			authenticate : function(body) {
				return new Promise(function(resolve, reject) {
					if (typeof body.email !== 'string' || typeof body.password !== 'string') { // runs when there is no email or no password
						return reject(); 
					}

					user.findOne({
						where: {
							email: body.email
						}
					}).then(function(user) { 
						if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) { // !user means email doesn't exists
							return reject();
						}

						resolve(user);
					}, function(e) {
						reject();
					});
				});
			},
			findByToken: function (token) {
				return new Promise(function(resolve, reject) {
					// Step 1: decode token
					// Step 2: decrypt data
					try {
						var decodedJWT = jwt.verify(token, 'qwerty098'); // call to verify that token has not been modified and is indeed valid
						var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'abc123!@#!');
						var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8)); // takes json string to convert to real javascript object

						user.findById(tokenData.id).then(function(user) {
							if (user) {
								resolve(user);
							} else {
								reject(); // id doesn't exist in database
							}
						}, function(e) {
							reject(); // database is not properly connected
						}); // 'findById' is a bulit-in function
					} catch(e) {
						reject(); // token is not in a valid format
					}
				});
			}
		},
		instanceMethods: { // acting on existing user object
			toPublicJSON: function() {
				var json = this.toJSON(); // to get the json object
				return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt'); // pick items from json object (first argument) to be displayed on postman
			},
			generateToken: function(type) { // type of token
				// create a token that encrypts data
				if (!_.isString(type)) {
					return undefined;
				}

				try {
					// Step 1: take the user data and encrypt them
					// Step 2: create a new token
					var stringData = JSON.stringify({id: this.get('id'), type: type}); // take user's data and turn it into a json string as AES can only encrypt json string
					var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123!@#!').toString(); // second argument is the secret password 
					var token = jwt.sign({
						token: encryptedData // pulled out the token properties (which we have the encryptedData), decrypt it and find the user by their id
					}, 'qwerty098'); // second argument is the jwt password

					return token;
				} catch(e) {
					console.error(e);
					return undefined;
				}
			}
		}
	});

	return user;
}