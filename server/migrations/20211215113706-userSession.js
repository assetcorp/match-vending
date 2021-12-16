'use strict'
const { UserSessionModel } = require( '../models/userSession.model' )

module.exports = {
	up: async ( queryInterface ) => {
		/**
		 * Add altering commands here.
		 *
		 * Example:
		 * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
		 */
		const ModelUserSession = UserSessionModel()
		await queryInterface.createTable( ModelUserSession.tableName, ModelUserSession.rawAttributes )
	},

	down: async ( queryInterface ) => {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
		const ModelUserSession = UserSessionModel()
		await queryInterface.dropTable( ModelUserSession.tableName )
	}
}
