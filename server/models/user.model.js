import { database } from '../database/db'
import UserSchema from '../schema/user.schema'
import crypto from 'crypto'
import { ProductModel } from './product.model'
import { UserSessionModel } from './userSession.model'

export const UserModel = () => {

	const User = database.define( 'user', UserSchema, {
		paranoid: true,
	} )

	User.generateSaltHash = () => {
		return crypto.randomBytes( 16 ).toString( 'base64' )
	}
	User.encryptPassword = ( passwordText, salt ) => {
		return crypto
			.createHash( 'RSA-SHA256' )
			.update( passwordText )
			.update( salt )
			.digest( 'hex' )
	}
	const updateUserPassword = user => {
		if ( user.changed( 'password' ) ) {
			user.passwordSalt = User.generateSaltHash()
			user.password = User.encryptPassword( user.password(), user.passwordSalt() )
		}
	}
	User.prototype.verifyPassword = function ( passwordText ) {
		return User.encryptPassword( passwordText, this.passwordSalt() ) === this.password()
	}
	User.beforeCreate( updateUserPassword )
	User.beforeUpdate( updateUserPassword )

	User.hasMany( ProductModel(), {
		sourceKey: 'refId',
		foreignKey: {
			field: 'sellerId',
		}
	} )

	User.hasMany( UserSessionModel(), {
		sourceKey: 'username',
		foreignKey: {
			field: 'username'
		}
	} )

	return User
}
