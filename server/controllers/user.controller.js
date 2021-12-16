import { UserModel } from '../models/user.model'
import { signJwt, syncDatabase } from '../utils'
import { UserSessionModel } from '../models/userSession.model'
import { v4 as uuidV4 } from 'uuid'

export const userSignUp = async ( username, password ) => {
	try {
		await syncDatabase()
		// All fields are required
		if ( !username || !password ) {
			throw new Error( 'One or more fields has not been set. Required fields: [username, password]' )
		}

		const newUser = {
			username,
			password,
		}

		const ModelUser = UserModel()
		// ModelUser.sync()

		// Check if user already exists
		const existingUser = await ModelUser.findAndCountAll( {
			where: { username }
		} )
		if ( existingUser.count ) {
			throw new Error( 'This user already exists.' )
		}

		// Create user
		const user = await ModelUser.create( newUser, { returning: true } )

		// Sign JWT
		const token = signJwt( { username: username, userId: user.refId } )

		// Save a new active session for the user
		const ModelSessionUser = UserSessionModel()
		// ModelSessionUser.sync()

		await ModelSessionUser.create( {
			username,
			sessionId: uuidV4(),
			sessionToken: token.token,
		} )

		return {
			error: false,
			message: 'User created successfully',
			status: 201,
			token: token.token,
		}

	} catch ( error ) {
		return {
			error: true,
			message: error.message || 'There was an internal server error',
			status: 500
		}
	}
}

export const userLogin = async ( username, password ) => {
	try {
		await syncDatabase()
		// All fields are required
		if ( !username || !password ) {
			throw new Error( 'One or more fields has not been set. Required fields: [username, password]' )
		}

		const ModelUser = UserModel()
		// ModelUser.sync()

		// Find user by username
		const user = await ModelUser.findOne( {
			where: { username }
		} )
		if ( !( user instanceof ModelUser ) || !user ) {
			throw new Error( `User with username '${username}' not found` )
		}
		// Verify user password
		const passwordVerified = user.verifyPassword( password )
		if ( !passwordVerified ) throw new Error( 'Invalid Password' )

		const ModelUserSession = UserSessionModel()
		// Check if user session already exists
		const availableSessions = await ModelUserSession.findAll( {
			where: { username }
		} )
		if ( availableSessions.length ) {
			throw new Error( 'There is already an active session using your account' )
		}

		// Sign JWT
		const token = signJwt( { username: user.username, userId: user.refId } )

		// Save a new active session for the user
		const ModelSessionUser = UserSessionModel()
		await ModelSessionUser.create( {
			username,
			sessionId: uuidV4(),
			sessionToken: token.token,
		} )

		return {
			error: false,
			message: 'User successfully logged in',
			status: 200,
			token: token.token,
		}

	} catch ( error ) {
		return {
			error: true,
			message: error.message || 'There was an internal server error',
			status: 500
		}
	}
}

export const getAllUsers = async ( limit = 10, offset = 0 ) => {
	try {
		await syncDatabase()
		const ModelUser = UserModel()
		// ModelUser.sync()

		// Find all users
		const users = await ModelUser.findAll( {
			attributes: ['username', 'deposit', 'role'],
			where: { deletedAt: null },
			limit,
			offset,
		} )

		return {
			error: false,
			message: '',
			status: 200,
			users: users || [],
		}

	} catch ( error ) {
		return {
			error: true,
			message: error.message || 'There was an internal server error',
			status: 500
		}
	}
}

export const getOneUser = async ( username ) => {
	try {
		await syncDatabase()
		// All fields are required
		if ( !username ) {
			throw new Error( 'One or more fields has not been set. Required fields: [username]' )
		}
		const ModelUser = UserModel()
		// ModelUser.sync()

		// Find one user
		const user = await ModelUser.findOne( {
			attributes: ['username', 'deposit', 'refId', 'role'],
			where: { username, deletedAt: null },
		} )

		if ( !user ) throw new Error( 'User not found' )

		return {
			error: false,
			message: '',
			status: 200,
			data: user,
		}

	} catch ( error ) {
		return {
			error: true,
			message: error.message || 'There was an internal server error',
			status: 500
		}
	}
}

// Only a user with 'buyer' role can deposit funds
export const patchUserDeposit = async ( username, amount ) => {
	try {
		await syncDatabase()
		// All fields are required
		if ( !username || !amount ) {
			throw new Error( 'One or more fields has not been set. Required fields: [username, amount]' )
		}

		// Ensure the deposit amount is valid
		if ( [5, 10, 20, 50, 100].indexOf( amount ) === -1 ) {
			throw new Error( 'The deposit amount has to be one of 5, 10, 20, 50, or 100 cent coins' )
		}

		const ModelUser = UserModel()
		// ModelUser.sync()

		// Just using this wrapper method incase we want to accept money greater than 100 cents and perhaps different currencies
		const newAmount = Number( amount )

		// Update user
		await ModelUser.update( {
			deposit: newAmount,
		}, {
			where: { username, role: 'buyer', deletedAt: null },
		} )

		const user = await ModelUser.findOne( {
			where: { username, role: 'buyer', deletedAt: null }
		} )

		return {
			error: false,
			message: 'User deposited funds successfully',
			status: 200,
			data: user || null
		}

	} catch ( error ) {
		return {
			error: true,
			message: error.message || 'There was an internal server error',
			status: 500
		}
	}
}

// Only a user with 'buyer' role can reset deposited funds
export const patchUserDepositReset = async ( username ) => {
	try {
		await syncDatabase()
		// All fields are required
		if ( !username ) {
			throw new Error( 'One or more fields has not been set. Required fields: [username]' )
		}

		const ModelUser = UserModel()
		// ModelUser.sync()
		// Update user
		await ModelUser.update( {
			deposit: 0,
		}, {
			where: { username, role: 'buyer' },
		} )

		return {
			error: false,
			message: 'User reset funds successfully',
			status: 200,
		}

	} catch ( error ) {
		return {
			error: true,
			message: error.message || 'There was an internal server error',
			status: 500
		}
	}
}

export const patchUserRole = async ( username, role ) => {
	try {
		await syncDatabase()
		// All fields are required
		if ( !username || !role ) {
			throw new Error( 'One or more fields has not been set. Required fields: [username, role]' )
		}

		// Validate role
		if ( ['buyer', 'seller'].indexOf( role ) === -1 ) {
			throw new Error( `Role must be one of ['buyer', 'seller']` )
		}

		// Update user
		const ModelUser = UserModel()
		// ModelUser.sync()
		await ModelUser.update( {
			role,
		}, {
			where: { username }
		} )

		return {
			error: false,
			message: 'User updated successfully',
			status: 200,
		}

	} catch ( error ) {
		return {
			error: true,
			message: error.message || 'There was an internal server error',
			status: 500
		}
	}
}

export const removeUser = async ( username ) => {
	try {
		await syncDatabase()
		// All fields are required
		if ( !username ) {
			throw new Error( 'One or more fields has not been set. Required fields: [username]' )
		}
		// Update user
		const ModelUser = UserModel()
		// ModelUser.sync()
		await ModelUser.destroy( {
			where: { username }
		} )

		return {
			error: false,
			message: 'User deleted successfully',
			status: 200,
		}

	} catch ( error ) {
		return {
			error: true,
			message: error.message || 'There was an internal server error',
			status: 500
		}
	}
}

export const restoreUserFromDeleted = async ( username ) => {
	try {
		await syncDatabase()
		// All fields are required
		if ( !username ) {
			throw new Error( 'One or more fields has not been set. Required fields: [username]' )
		}
		// Update user
		const ModelUser = UserModel()
		// ModelUser.sync()
		await ModelUser.restore( {
			where: { username }
		} )

		return {
			error: false,
			message: 'User restored successfully',
			status: 200,
		}

	} catch ( error ) {
		return {
			error: true,
			message: error.message || 'There was an internal server error',
			status: 500
		}
	}
}
