import { userLogout, userLogoutAll } from "../controllers/userSession.controller"
import { buildErrorResponse, buildResponse, genericErrorMessage, validateJwt } from "../utils"


export const logoutUserSession = async ( req, res ) => {
	try {
		if ( await validateJwt( req, res ) ) {
			const { username } = req.jwt
			const token = req.tokenString

			const user = await userLogout( username, token )
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

export const logoutAllUserSessions = async ( req, res ) => {
	try {
		if ( await validateJwt( req, res ) ) {
			const { username } = req.jwt

			const user = await userLogoutAll( username )
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
