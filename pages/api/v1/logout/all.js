import { logoutAllUserSessions } from '../../../../server/handles/userSession.handler'

import { runCors, setDefaultResponse } from '../../../../server/utils'

export default async ( req, res ) => {
	const method = req.method
	await runCors( req, res ) // Run the CORS middleware


	switch ( method ) {
		case 'POST':
			return logoutAllUserSessions( req, res )
		default:
			return setDefaultResponse( res )
	}
}
