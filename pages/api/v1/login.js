import { loginUser } from '../../../server/handles/user.handler'
import { runCors, setDefaultResponse } from '../../../server/utils'

export default async ( req, res ) => {
	const method = req.method
	await runCors( req, res ) // Run the CORS middleware


	switch ( method ) {
		case 'POST':
			return loginUser( req, res )
		default:
			return setDefaultResponse( res )
	}
}
