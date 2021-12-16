const Sequelize = require( 'sequelize' )
const fs = require( 'fs' )
const path = require( 'path' )
const dotenv = require( 'dotenv' )
const NODE_ENV_TEST = process.env.NODE_ENV === 'test'
dotenv.config( {
	path: path.resolve( __dirname, '../../', NODE_ENV_TEST ? '.env.test.local' : '.env' )
} )

const envProcess = process.env
const databaseConfig =  {
  HOST: envProcess.DB_HOST,
  USER: envProcess.DB_USER,
  PASSWORD: envProcess.DB_PASSWORD,
  DB: envProcess.DB_NAME,
  dialect: envProcess.DB_DIALECT,
  pool: {
    max: parseInt( envProcess.DB_POOL_MAX ),
    min: parseInt( envProcess.DB_POOL_MIN ),
    acquire: parseInt( envProcess.DB_POOL_ACQUIRE ),
    idle: parseInt( envProcess.DB_POOL_IDLE ),
  },
	define: {
		underscored: false,
		charset: 'utf8mb4',
		collate: 'utf8mb4_unicode_ci',
		timestamps: true
	}
}

console.log( databaseConfig )


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
const db = {
	models: {}
}
fs
	.readdirSync( __dirname )
	.filter( file => {
		return ( file.indexOf( '.' ) !== 0 ) && ( file !== basename ) && ( file.slice( -3 ) === '.js')
	} )
	.forEach( file => {
		console.log(file)
		const model = require( path.join( __dirname, file ) )
		console.log(model.name)
		db.models[model.name] = model
	} )

Object.keys( db.models ).forEach( modelName => {
	if ( db.models[modelName].associate ) {
		db.models[modelName].associate( db )
	}
} )

db.sequelize = sequelizeConnection
db.Sequelize = Sequelize

module.exports = db

