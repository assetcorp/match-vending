const path = require( 'path' )
const dotenv = require( 'dotenv' )
const NODE_ENV_TEST = process.env.NODE_ENV === 'test'
dotenv.config( {
	path: path.resolve( __dirname, '../../', NODE_ENV_TEST ? '.env.test.local' : '.env' )
} )

const envProcess = process.env

module.exports = {
	host: envProcess.DB_HOST,
	username: envProcess.DB_USER,
	password: envProcess.DB_PASSWORD,
	database: envProcess.DB_NAME,
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
