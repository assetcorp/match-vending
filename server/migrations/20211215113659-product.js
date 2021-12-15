'use strict'
const { ProductModel } = require( '../models/product.model' )

module.exports = {
	up: async ( queryInterface ) => {
		/**
		 * Add altering commands here.
		 *
		 * Example:
		 * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
		 */
		const ModelProduct = ProductModel()
		await queryInterface.createTable( ModelProduct.tableName, ModelProduct.rawAttributes )
	},

	down: async ( queryInterface ) => {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
		const ModelProduct = ProductModel()
		await queryInterface.dropTable( ModelProduct.tableName )
	}
}
