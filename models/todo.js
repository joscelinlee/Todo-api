module.exports = function(sequelize, DataTypes) { // sequelize instance
	return sequelize.define('todo', { // first argument is model name, second argument is attributes configuration
		description: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				//notEmpty: true // Prevent empty string from being added. Cannot be empty string.
				len: [1, 250] // 1<=x<=250
			}
		},
		completed: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		}
	});
}