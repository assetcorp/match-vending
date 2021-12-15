import { createProduct, getOneProduct, restoreProduct } from '../../../server/controllers/product.controller'
import { deleteProduct, patchUpProduct } from '../../../server/handles/product.handler'
import { runCors, setDefaultResponse } from '../../../server/utils'

export default async ( req, res ) => {
	const method = req.method
	await runCors( req, res ) // Run the CORS middleware

	switch ( method ) {
		case 'POST':
			return createProduct( req, res )
		case 'GET':
			return getOneProduct( req, res )
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
