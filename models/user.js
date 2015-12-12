var bcrypt = require('bcrypt'); // specify module name
var _ = require('underscore');

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
			}
		},
		instanceMethods: {
			toPublicJSON: function() {
				var json = this.toJSON(); // to get the json object
				return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt'); // pick items from json object (first argument) to be displayed on postman
			}
		}
	});

	return user;
}