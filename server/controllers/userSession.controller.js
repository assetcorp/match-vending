import { UserSessionModel } from "../models/userSession.model"


export const getSessionByToken = async ( token ) => {
	try {
		// All fields are required
		if ( !token ) {
			throw new Error( 'One or more fields has not been set. Required fields: [token]' )
		}

		const ModelSessionUser = UserSessionModel()
		const session = await ModelSessionUser.findOne( {
			where: { sessionToken: token },
		} )
		if ( !session ) {
			throw new Error( 'You do not seem to be logged in. Please log in.' )
		}

		return {
			error: false,
			message: '',
			status: 200,
			session,
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
