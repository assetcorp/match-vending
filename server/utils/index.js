import jwt from 'jsonwebtoken'
import jwtConfig from '../config/jwt.config'
import appConfig from '../config/app.config'
import Cors from 'cors'
import dotenv from 'dotenv'
import { getSessionByToken } from '../controllers/userSession.controller'
import { getOneUser } from '../controllers/user.controller'
import { UserModel } from '../models/user.model'
import { UserSessionModel } from '../models/userSession.model'
import { ProductModel } from '../models/product.model'


dotenv.config()

export const buildResponse = ( message = 'Not found', data = null ) => {
	return {
		message,
		data,
	}
}

export const genericErrorMessage = 'There was an internal server error'

export const buildErrorResponse = ( message = genericErrorMessage, data = null ) => {
	return buildResponse( message, data )
}

export const setDefaultResponse = ( res, code = 405, message = 'We cannot process this request', data = null ) => {
	res.status( code ).json( buildErrorResponse( message, data ) )
}

export const validateRequest = ( req, res, fields = [], reqType = 'body', errorCode = 400 ) => {
	try {
		const reqParams = Object.keys( req[reqType] )
		let pass = true
		let message = 'Some required fields are missing'

		for ( let item of fields ) {
			if ( reqParams.indexOf( item ) === -1 ) {
				pass = false
				message = `The '${item}' field is required`
				break
			}
		}

		if ( !pass )
			return res.status( errorCode ).send( buildErrorResponse( message ) )

		return true
	} catch ( error ) {
		return res.status( 500 ).send( buildErrorResponse( genericErrorMessage ) )
	}
}

export const signJwt = ( payload, expiry = '1y' ) => {
	return {
		token: jwt.sign( payload, jwtConfig.secret, { expiresIn: expiry } ),
	}
}

export const verifyJwt = token => {
	return jwt.verify( token, jwtConfig.secret )
}

export const validateJwt = async ( req, res ) => {
	console.log( req.headers )
	if ( req.headers['authorization'] ) {
		try {
			let authorization = req.headers['authorization'].split( ' ' )
			const tokenType = authorization[0]
			const tokenString = authorization[1]
			// const rememberME = authorization[2]
			if ( tokenType !== 'Bearer' ) {
				return res.status( 401 ).send( buildErrorResponse( 'You are not authenticated' ) )
			} else {
				req.jwt = verifyJwt( tokenString )
				req.tokenString = tokenString

				// If user has token, check if there is an active session
				const session = await getSessionByToken( tokenString )
				if ( session.error ) {
					return res.status( 401 ).send( buildErrorResponse( 'You do not have any active sessions. Please log in again.' ) )
				}

				// A deleted user cannot log in
				const userDetails = await getOneUser( req.jwt.username )
				if ( userDetails.error ) {
					return res.status( 401 ).send( buildErrorResponse( 'User does not exist.' ) )
				}

				req.userDetails = userDetails.data

				return true
			}
		} catch ( err ) {
			let status = 403
			let message = 'You do not have permission to access the requested resource'

			if ( err.name && err.name === 'TokenExpiredError' ) {
				status = 401
				message = 'Your token has expired. Please log in again.'
			}
			return res.status( 403 ).send( buildErrorResponse( status, message ) )
		}
	} else {
		return res.status( 401 ).send( buildErrorResponse( 'You are not authenticated' ) )
	}
}

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
// https://nextjs.org/docs/api-routes/api-middlewares
export const runMiddleware = ( req, res, fn ) => {
	return new Promise( ( resolve, reject ) => {
		fn( req, res, result => {
			if ( result instanceof Error ) {
				return reject( result )
			}

			return resolve( result )
		} )
	} )
}

export const runCors = async ( req, res ) => {
	// Allow for all origins
	const cors = Cors( {
		methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
		origin: ( origin, callback ) => {
			// For local development, allow for all routes
			if ( !origin ) callback( null, true )
			if ( origin.indexOf( 'localhost' ) !== -1 || appConfig.WHITELIST_DOMAINS.indexOf( origin ) !== -1 ) {
				callback( null, true )
			} else {
				console.log( origin )
				callback( new Error( 'Not allowed' ) )
			}
		}
	} )

	await runMiddleware( req, res, cors )
}

export const syncDatabase = async () => {
	try {
		const ModelUser = UserModel()
		const ModelUserSession = UserSessionModel()
		const ModelProduct = ProductModel()

		const models = {
			ModelUser,
			ModelUserSession,
			ModelProduct,
		}

		for ( let item of Object.keys(models) ) {
			console.log( 'Syncing model' )
			await models[item].sync()
			console.log( 'Syncing model finished' )
		}
	} catch ( error ) {
		console.error( error.message || 'Sync database failed' )
	}
}
