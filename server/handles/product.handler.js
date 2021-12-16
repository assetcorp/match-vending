import {
	buyProduct,
	createProduct, getAllProducts, getOneProduct, removeProduct,
	transferProductOwnership, updateProductCost, updateProductName,
	updateProductStock
} from "../controllers/product.controller"
import { buildErrorResponse, buildResponse, genericErrorMessage, validateJwt, validateRequest } from "../utils"


export const newProduct = async ( req, res ) => {
	try {
		const requiredBody = ['productName', 'cost', 'amountAvailable']
		if ( await validateJwt( req, res ) &&
			validateRequest( req, res, requiredBody, 'body' ) ) {
			const { productName, cost, amountAvailable } = req.body
			const userId = req.jwt.userId
			const userIsSeller = req.userDetails.role === 'seller'
			console.log( req.userDetails )

			if ( !userIsSeller ) {
				throw {
					status: 401,
					message: `Only users with the 'seller' role can create a product`,
				}
			}

			const newProduct = await createProduct(
				userId,
				productName,
				cost,
				amountAvailable
			)
			if ( newProduct.error ) throw newProduct

			return res
				.status( newProduct.status )
				.send( buildResponse( newProduct.message, newProduct.data ) )
		}
	} catch ( error ) {
		return res
			.status( error.status || 500 )
			.send( buildErrorResponse( error.message || genericErrorMessage ) )
	}
}

export const allProducts = async ( req, res ) => {
	try {
		if ( await validateJwt( req, res ) ) {
			const { limit, offset } = req.query

			const products = await getAllProducts( limit, offset )
			if ( products.error ) throw new Error( products )

			return res
				.status( products.status )
				.send( buildResponse( products.message, products.data ) )
		}
	} catch ( error ) {
		return res
			.status( error.status || 500 )
			.send( buildErrorResponse( error.message || genericErrorMessage ) )
	}
}

export const singleProduct = async ( req, res ) => {
	try {
		const requiredBody = ['productId']
		if ( await validateJwt( req, res ) &&
			validateRequest( req, res, requiredBody, 'body' ) ) {
			const { productId } = req.body

			const product = await getOneProduct( productId )
			if ( product.error ) throw new Error( product )

			return res
				.status( product.status )
				.send( buildResponse( product.message, product.data ) )
		}
	} catch ( error ) {
		return res
			.status( error.status || 500 )
			.send( buildErrorResponse( error.message || genericErrorMessage ) )
	}
}

export const patchUpProduct = async ( req, res ) => {
	try {
		const requiredBody = ['productId']
		if ( await validateJwt( req, res ) &&
			validateRequest( req, res, requiredBody, 'body' ) ) {
			const { productId } = req.body
			const userId = req.jwt.userId

			if ( 'productName' in req.body ) {
				const newProduct = await updateProductName( userId, productId, req.body.productName )
				if ( newProduct.error ) throw newProduct
			}
			if ( 'cost' in req.body ) {
				const newProduct = await updateProductCost( userId, productId, req.body.cost )
				if ( newProduct.error ) throw newProduct
			}
			if ( 'amountAvailable' in req.body ) {
				const newProduct = await updateProductStock( userId, productId, req.body.amountAvailable )
				if ( newProduct.error ) throw newProduct
			}
			if ( 'transferOwner' in req.body ) {
				const newProduct = await transferProductOwnership( userId, productId, req.body.transferOwner )
				if ( newProduct.error ) throw newProduct
			}

			const product = await getOneProduct( productId )
			if ( product.error ) throw new Error( product )

			return res
				.status( product.status )
				.send( buildResponse( product.message, product.data ) )
		}
	} catch ( error ) {
		return res
			.status( error.status || 500 )
			.send( buildErrorResponse( error.message || genericErrorMessage ) )
	}
}

export const deleteProduct = async ( req, res ) => {
	try {
		const requiredBody = ['productId']
		if ( await validateJwt( req, res ) &&
			validateRequest( req, res, requiredBody, 'body' ) ) {
			const { productId } = req.body
			const userId = req.jwt.userId

			const product = await removeProduct( userId, productId )
			if ( product.error ) throw product

			return res
				.status( product.status )
				.send( buildResponse( product.message ) )
		}
	} catch ( error ) {
		return res
			.status( error.status || 500 )
			.send( buildErrorResponse( error.message || genericErrorMessage ) )
	}
}

export const restoreProduct = async ( req, res ) => {
	try {
		const requiredBody = ['productId']
		if ( await validateJwt( req, res ) &&
			validateRequest( req, res, requiredBody, 'body' ) ) {
			const { productId } = req.body
			const userId = req.jwt.userId

			const product = await restoreProduct( userId, productId )
			if ( product.error ) throw new Error( product )

			return res
				.status( product.status )
				.send( buildResponse( product.message ) )
		}
	} catch ( error ) {
		console.error( error )
		return res
			.status( error.status || 500 )
			.send( buildErrorResponse( error.message || genericErrorMessage ) )
	}
}

export const buySingleProduct = async ( req, res ) => {
	try {
		const requiredBody = ['productId', 'units']
		if ( await validateJwt( req, res ) &&
			validateRequest( req, res, requiredBody, 'body' ) ) {
			const { productId, units } = req.body
			const username = req.jwt.username
			const depositAmount = req.userDetails.deposit || 0
			const userIsBuyer = req.userDetails.role === 'buyer'

			if ( !userIsBuyer ) {
				throw {
					status: 401,
					message: `Only users with the 'buyer' role can purchase a product`,
				}
			}

			const newProduct = await buyProduct( depositAmount, username, productId, units )
			if ( newProduct.error ) throw newProduct

			return res
				.status( newProduct.status )
				.send( buildResponse( newProduct.message, newProduct.data ) )
		}
	} catch ( error ) {
		return res
			.status( error.status || 500 )
			.send( buildErrorResponse( error.message || genericErrorMessage ) )
	}
}
