import {
	getAllUsers, getOneUser, patchUserDeposit, patchUserDepositReset,
	patchUserRole, removeUser, restoreUserFromDeleted, userLogin, userSignUp,
} from '../controllers/user.controller'
import { buildErrorResponse, buildResponse, genericErrorMessage, validateJwt, validateRequest } from '../utils'

export const signUpUser = async ( req, res ) => {
	try {
		const requiredBody = ['username', 'password']
		if ( validateRequest( req, res, requiredBody, 'body' ) ) {
			const { username, password } = req.body

			const newUser = await userSignUp( username, password )
			if ( newUser.error ) throw newUser

			return res.status( newUser.status )
				.send( buildResponse( newUser.message, {
					token: newUser.token
				} ) )
		}
	} catch ( error ) {
		return res
			.status( error.status || 500 )
			.send( buildErrorResponse( error.message || genericErrorMessage ) )
	}
}

export const loginUser = async ( req, res ) => {
	try {
		const requiredBody = ['username', 'password']
		if ( validateRequest( req, res, requiredBody, 'body' ) ) {
			const { username, password } = req.body

			const user = await userLogin( username, password )
			if ( user.error ) throw user

			return res
				.status( user.status )
				.send( buildResponse( user.message, { token: user.token } ) )
		}
	} catch ( error ) {
		return res
			.status( error.status || 500 )
			.send( buildErrorResponse( error.message || genericErrorMessage ) )
	}
}

export const allUsers = async ( req, res ) => {
	try {
		if ( await validateJwt( req, res ) ) {
			const { limit, offset } = req.query

			const allUsers = await getAllUsers( limit, offset )
			if ( allUsers.error ) throw new Error( allUsers )

			return res
				.status( allUsers.status )
				.send( buildResponse( allUsers.message, allUsers.users ) )
		}
	} catch ( error ) {
		return res
			.status( error.status || 500 )
			.send( buildErrorResponse( error.message || genericErrorMessage ) )
	}
}

export const singleUser = async ( req, res ) => {
	try {
		if ( await validateJwt( req, res ) ) {
			const username = req.jwt.username

			const user = await getOneUser( username )
			if ( user.error ) throw new Error( user )

			return res
				.status( user.status )
				.send( buildResponse( user.message, user.data ) )
		}
	} catch ( error ) {
		return res
			.status( error.status || 500 )
			.send( buildErrorResponse( error.message || genericErrorMessage ) )
	}
}

export const patchUpUser = async ( req, res ) => {
	try {
		if ( await validateJwt( req, res ) ) {
			const username = req.jwt.username

			if ( 'deposit' in req.body ) {
				const newUser = await patchUserDeposit( username, req.body.deposit )
				if ( newUser.error ) throw new Error( newUser )
			}
			if ( 'depositReset' in req.body ) {
				const newUser = await patchUserDepositReset( username )
				if ( newUser.error ) throw new Error( newUser )
			}
			if ( 'role' in req.body ) {
				const newUser = await patchUserRole( username, req.body.role )
				if ( newUser.error ) throw new Error( newUser )
			}

			const user = await getOneUser( username )
			if ( user.error ) throw new Error( user )

			return res
				.status( user.status )
				.send( buildResponse( user.message, user.data ) )
		}
	} catch ( error ) {
		return res
			.status( error.status || 500 )
			.send( buildErrorResponse( error.message || genericErrorMessage ) )
	}
}

export const depositAmount = async ( req, res ) => {
	try {
		const requiredBody = ['amount']
		if ( await validateJwt( req, res ) &&
			validateRequest( req, res, requiredBody, 'body' ) ) {
			const { amount } = req.body
			const username = req.jwt.username
			const userIsBuyer = req.userDetails.role === 'buyer'

			if ( !userIsBuyer ) {
				throw {
					status: 401,
					message: `Only users with the 'buyer' role can purchase a product`,
				}
			}

			const user = await patchUserDeposit( username, amount )
			if ( user.error ) throw user

			return res
				.status( user.status )
				.send( buildResponse( user.message, user.data ) )
		}
	} catch ( error ) {
		return res
			.status( error.status || 500 )
			.send( buildErrorResponse( error.message || genericErrorMessage ) )
	}
}

export const resetDepositAmount = async ( req, res ) => {
	try {
		if ( await validateJwt( req, res ) ) {
			const username = req.jwt.username

			const user = await patchUserDepositReset( username )
			if ( user.error ) throw user

			return res
				.status( user.status )
				.send( buildResponse( user.message ) )
		}
	} catch ( error ) {
		return res
			.status( error.status || 500 )
			.send( buildErrorResponse( error.message || genericErrorMessage ) )
	}
}

export const deleteUser = async ( req, res ) => {
	try {
		if ( await validateJwt( req, res ) ) {
			const username = req.jwt.username

			const user = await removeUser( username )
			if ( user.error ) throw new Error( user )

			return res
				.status( user.status )
				.send( buildResponse( user.message, user.data ) )
		}
	} catch ( error ) {
		return res
			.status( error.status || 500 )
			.send( buildErrorResponse( error.message || genericErrorMessage ) )
	}
}

export const restoreUser = async ( req, res ) => {
	try {
		if ( await validateJwt( req, res ) ) {
			const username = req.jwt.username

			const user = await restoreUserFromDeleted( username )
			if ( user.error ) throw new Error( user )

			return res
				.status( user.status )
				.send( buildResponse( user.message, user.data ) )
		}
	} catch ( error ) {
		return res
			.status( error.status || 500 )
			.send( buildErrorResponse( error.message || genericErrorMessage ) )
	}
}
