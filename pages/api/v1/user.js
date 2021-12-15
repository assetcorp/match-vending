import { deleteUser, patchUpUser, restoreUser, signUpUser, singleUser } from '../../../server/handles/user.handler'
import { runCors, setDefaultResponse } from '../../../server/utils'

export default async ( req, res ) => {
	const method = req.method
	await runCors( req, res ) // Run the CORS middleware

	switch ( method ) {
		case 'POST':
			return signUpUser( req, res )
		case 'GET':
			return singleUser( req, res )
		case 'PATCH':
			return patchUpUser( req, res )
		case 'PUT':
			return restoreUser( req, res )
		case 'DELETE':
			return deleteUser( req, res )
		default:
			return setDefaultResponse( res )
	}
}
