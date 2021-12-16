import databaseConfig from '../config/db.config'
import { Sequelize } from 'sequelize'

// Database connection via sequelize
const database = new Sequelize(
	databaseConfig.DB,
	databaseConfig.USER,
	databaseConfig.PASSWORD, {
	host: databaseConfig.HOST,
	dialect: databaseConfig.dialect,
	pool: {
		min: databaseConfig.pool.min,
		max: databaseConfig.pool.max,
		acquire: databaseConfig.pool.acquire,
		idle: databaseConfig.pool.idle,
	}
} )

export {
	database
}
