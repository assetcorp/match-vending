'use strict'
const { UserModel } = require( '../models/user.model' )

module.exports = {
	up: async ( queryInterface ) => {
		/**
		 * Add altering commands here.
		 *
		 * Example:
		 * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
		 */
		const ModelUser = UserModel()
		await queryInterface.createTable( ModelUser.tableName, ModelUser.rawAttributes )
	},

	down: async ( queryInterface ) => {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
		const ModelUser = UserModel()
		await queryInterface.dropTable( ModelUser.tableName )
	}
};
