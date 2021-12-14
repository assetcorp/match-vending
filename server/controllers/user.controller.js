import { UserModel } from '../models/user.model'
import { signJwt } from '../utils'
import * as Money from 'dinero.js'
import { UserSessionModel } from '../models/userSession.model'
import { v4 as uuidV4 } from 'uuid'

export const userSignUp = async ( username, password ) => {
	try {
		// All fields are required
		if ( !username || !password ) {
			throw new Error( 'One or more fields has not been set. Required fields: [username, password]' )
		}

		const newUser = {
			username,
			password,
		}

		const ModelUser = UserModel()

		// Create user
		const user = await ModelUser.create( newUser, { returning: true } )

		// Sign JWT
		const token = signJwt( { username: username.toLowerCase(), userId: user.refId } )

		// Save a new active session for the user
		const ModelSessionUser = UserSessionModel()
		await ModelSessionUser.create( {
			username,
			sessionId: uuidV4(),
			sessionToken: token,
		} )

		return {
			error: false,
			message: 'User created successfully',
			status: 201,
			token,
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
		// All fields are required
		if ( !username || !password ) {
			throw new Error( 'One or more fields has not been set. Required fields: [username, password]' )
		}

		const ModelUser = UserModel()

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
			sessionToken: token,
		} )

		return {
			error: false,
			message: 'User successfully logged in',
			status: 200,
			token,
		}

	} catch ( error ) {
		return {
			error: true,
			message: error.message || 'There was an internal server error',
			status: 500
		}
	}
}

export const userLogout = async ( username, token ) => {
	try {
		// All fields are required
		if ( !username || !token ) {
			throw new Error( 'One or more fields has not been set. Required fields: [username, token]' )
		}

		const ModelSessionUser = UserSessionModel()

		const sessionsDeleted = await ModelSessionUser.destroy( {
			where: { sessionToken: token },
			force: true,
		} )
		if ( !sessionsDeleted ) {
			throw new Error( 'You do not seem to be logged in. Please log in.' )
		}

		return {
			error: false,
			message: 'User successfully logged out',
			status: 200,
			token,
		}

	} catch ( error ) {
		return {
			error: true,
			message: error.message || 'There was an internal server error',
			status: 500
		}
	}
}

export const userLogoutAll = async ( username ) => {
	try {
		// All fields are required
		if ( !username ) {
			throw new Error( 'One or more fields has not been set. Required fields: [username]' )
		}

		const ModelSessionUser = UserSessionModel()

		const sessionsDeleted = await ModelSessionUser.destroy( {
			where: { username },
			force: true,
		} )
		if ( !sessionsDeleted ) {
			throw new Error( 'You do not seem to be logged in. Please log in.' )
		}

		return {
			error: false,
			message: 'User successfully logged out',
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

export const getAllUsers = async ( limit = 10, offset = 0 ) => {
	try {
		const ModelUser = UserModel()

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
		// All fields are required
		if ( !username ) {
			throw new Error( 'One or more fields has not been set. Required fields: [username]' )
		}
		const ModelUser = UserModel()

		// Find one user
		const user = await ModelUser.findAll( {
			where: { username, deletedAt: null },
		} )

		return {
			error: false,
			message: '',
			status: 200,
			users: user,
		}

	} catch ( error ) {
		return {
			error: true,
			message: error.message || 'There was an internal server error',
			status: 500
		}
	}
}

export const patchUserDeposit = async ( username, amount ) => {
	try {
		// All fields are required
		if ( !username || !amount ) {
			throw new Error( 'One or more fields has not been set. Required fields: [username, amount]' )
		}

		// Ensure the deposit amount is valid
		if ( [5, 10, 20, 50, 100].indexOf( amount ) === -1 ) {
			throw new Error( 'The deposit amount has to be one of 5, 10, 20, 50, or 100 cent coins' )
		}

		const ModelUser = UserModel()

		// Just using this wrapper method incase we want to accept money greater than 100 cents and perhaps different currencies
		const newAmount = Money( { amount } )

		// Update user
		await ModelUser.update( {
			deposit: newAmount.toUnit(),
		}, {
			where: { username }
		} )

		return {
			error: false,
			message: 'User deposited funds successfully',
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

export const patchUserDepositReset = async ( username ) => {
	try {
		// All fields are required
		if ( !username ) {
			throw new Error( 'One or more fields has not been set. Required fields: [username]' )
		}

		const ModelUser = UserModel()
		// Update user
		await ModelUser.update( {
			deposit: 0,
		}, {
			where: { username }
		} )

		return {
			error: false,
			message: 'User deposited funds successfully',
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
		// All fields are required
		if ( !username || !role ) {
			throw new Error( 'One or more fields has not been set. Required fields: [username, role]' )
		}

		const ModelUser = UserModel()

		// Update user
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
