import { deleteProduct, newProduct, patchUpProduct, restoreProduct, singleProduct } from '../../../server/handles/product.handler'
import { runCors, setDefaultResponse } from '../../../server/utils'

export default async ( req, res ) => {
	const method = req.method
	await runCors( req, res ) // Run the CORS middleware


	switch ( method ) {
		case 'POST':
			return newProduct( req, res )
		case 'GET':
			return singleProduct( req, res )
		case 'PATCH':
			return patchUpProduct( req, res )
		case 'PUT':
			return restoreProduct( req, res )
		case 'DELETE':
			return deleteProduct( req, res )
		default:
			return setDefaultResponse( res )
	}
}
