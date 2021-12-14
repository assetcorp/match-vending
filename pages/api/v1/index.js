import { runCors, setDefaultResponse } from '../../../server/utils'

export default async ( req, res ) => {
	const method = req.method
	await runCors( req, res ) // Run the CORS middleware

	switch ( method ) {
		default:
			return setDefaultResponse( res )
	}
}
