// store hash values of the token
// token lets you access data so it's better to hash it
var cryptojs = require('crypto-js');

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('token', {
		token: {
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validate: {
				len: [1] // length of token greater than 1
			},
			set: function(value) {
				var hash = cryptojs.MD5(value).toString(); // another type of hashing algorithm

				this.setDataValue('token', value);
				this.setDataValue('tokenHash', hash);
			}
		},
		tokenHash: DataTypes.STRING
	});
};