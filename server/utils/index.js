import jwt from 'jsonwebtoken'
import jwtConfig from '../config/jwt.config'
import appConfig from '../config/app.config'
import Cors from 'cors'
import dotenv from 'dotenv'

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
      return res.status( errorCode ).send( buildErrorResponse( errorCode, message ) )

    return true
  } catch ( error ) {
    return res.status( 500 ).send( buildErrorResponse( 500 ) )
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

export const validateJwt = ( req, res ) => {
  if ( req.headers['x-authentication-token'] ) {
    try {
      let authorization = req.headers['x-authentication-token']
      req.jwt = verifyJwt( authorization )
      return true
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
    return res.status( 401 ).send( buildErrorResponse( 401, 'You are not authenticated' ) )
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