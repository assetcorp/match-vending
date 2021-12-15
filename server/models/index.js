const databaseConfig = require( '../config/db.config' )
const Sequelize = require( 'sequelize' )
const fs = require( 'fs' )
const path = require( 'path' )

// Database connection via sequelize
const sequelizeConnection = new Sequelize(
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
	},
	define: {
		underscored: false,
		charset: 'utf8mb4',
		collate: 'utf8mb4_unicode_ci',
		timestamps: true
	}
} )

const basename = path.basename( __filename )
const db = {}
fs
	.readdirSync( __dirname )
	.filter( file => {
		return ( file.indexOf( '.' ) !== 0 ) && ( file !== basename ) && ( file.slice( -3 ) === '.js' )
	} )
	.forEach( file => {
		const model = require( path.join( __dirname, file ) )
		db[model.name] = model
	} )

Object.keys( db ).forEach( modelName => {
	if ( db[modelName].associate ) {
		db[modelName].associate( db )
	}
} )

db.sequelize = sequelizeConnection
db.Sequelize = Sequelize

module.exports = db

