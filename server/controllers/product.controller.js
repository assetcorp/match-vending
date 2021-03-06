import { ProductModel } from '../models/product.model'
import { database } from '../database/db'
import { UserModel } from '../models/user.model'
import * as lodash from 'lodash'
import { syncDatabase } from '../utils'

/**
 * Splits an amount into an array of smaller amounts.
 * @param {Number} amount The amount to split
 * @param {Array} validCents An array of values representing the cents to split. This array must not be more than 10 elements
 * @returns An array of values that adds to amount but containing elements of validCents
 */
const convertAmountIntoArrayParts = ( amount, validCents = [5, 10, 20, 50, 100] ) => {
	let centArray = []
	let newCents = [...validCents]
	if ( validCents.length > 10 ) return centArray

	// eslint-disable-next-line no-unused-vars
	for ( let item of validCents ) {
		const closest = Math.max.apply( null, newCents.filter( function ( v ) { return v <= amount } ) )
		const closestIndex = validCents.indexOf( closest )
		centArray.push( validCents[closestIndex] )

		if ( lodash.sum( centArray ) === amount ) {
			return centArray
		}

		const centManipulate = [...newCents]
		centManipulate.splice( closestIndex, 1 )

		newCents = [...centManipulate]
	}

	return centArray
}

export const buyProduct = async ( depositAmount, username, productId, totalUnits ) => {
	try {
		await syncDatabase()
		// All fields are required. NOTE: totalUnits and depositAmount MUST not be zero
		if ( !depositAmount || !username || !productId || !totalUnits ) {
			throw new Error( 'One or more fields has not been set. Required fields: [depositAmount, username, productId, totalUnits]' )
		}

		// Get the product details
		const ModelProduct = ProductModel()
		// ModelProduct.sync()
		const productDetails = await ModelProduct.findOne( {
			where: { productId, deletedAt: null }
		} )
		if ( !( productDetails instanceof ModelProduct ) || !productDetails ) {
			throw new Error( `Product with ID '${productId}' not found` )
		}

		const productStockRemaining = productDetails.amountAvailable - totalUnits
		if ( productStockRemaining < 0 ) {
			throw new Error( `Cannot fulfil purchase for this product since the total number in stock for the product is ${productDetails.amountAvailable}.` )
		}
		const userUnitDeposit = Number( depositAmount )
		const totalCostOfPurchase = Number( productDetails.cost ) * totalUnits
		if ( totalCostOfPurchase > userUnitDeposit ) {
			throw new Error( 'You do not have enough balance to purchase this product' )
		}
		const totalUserBalanceAfterPurchase = userUnitDeposit - totalCostOfPurchase

		let updatedProduct = productDetails
		updatedProduct.amountAvailable = productStockRemaining

		// Record the purchase. Using a transaction to ensure that everything happens at the same time
		await database.transaction( async t => {
			// Debit the users' account
			const ModelUser = UserModel()
			await ModelUser.update( {
				deposit: 0,
			}, {
				where: { username },
				transaction: t,
			} )

			// Update the product
			await ModelProduct.update( {
				amountAvailable: productStockRemaining
			}, {
				where: { productId },
				transaction: t,
			} )
		} )

		return {
			error: false,
			message: 'Purchase was successful',
			status: 200,
			data: {
				totalCostOfPurchase,
				purchasedProduct: updatedProduct,
				change: !totalUserBalanceAfterPurchase ? [0] :
					convertAmountIntoArrayParts( totalUserBalanceAfterPurchase, [5, 10, 20, 50, 100] )
			}
		}

	} catch ( error ) {
		return {
			error: true,
			message: error.message || 'There was an internal server error',
			status: 500
		}
	}
}

export const getAllProducts = async ( limit = 10, offset = 0 ) => {
	try {
		await syncDatabase()
		const ModelProduct = ProductModel()
		// ModelProduct.sync()

		// Find all products
		const products = await ModelProduct.findAll( {
			where: { deletedAt: null },
			limit,
			offset,
		} )

		return {
			error: false,
			message: '',
			status: 200,
			data: products || [],
		}

	} catch ( error ) {
		return {
			error: true,
			message: error.message || 'There was an internal server error',
			status: 500
		}
	}
}

export const getOneProduct = async ( productId ) => {
	try {
		await syncDatabase()
		// All fields are required.
		if ( !productId ) {
			throw new Error( 'One or more fields has not been set. Required fields: [productId]' )
		}

		// Find one product
		const ModelProduct = ProductModel()
		// ModelProduct.sync()
		const product = await ModelProduct.findOne( {
			where: { productId, deletedAt: null }
		} )
		if ( !product ) {
			throw new Error( `Product with ID '${productId}' not found.` )
		}

		return {
			error: false,
			message: '',
			status: 200,
			data: product,
		}

	} catch ( error ) {
		return {
			error: true,
			message: error.message || 'There was an internal server error',
			status: 500
		}
	}
}

// NOTE: Only the owner of the product should be able to update product
export const updateOneProduct = async ( userId, productId, productName, cost, amountAvailable ) => {
	try {
		await syncDatabase()
		// All fields are required.
		if ( !userId, !productId || !productName || !cost || !amountAvailable ) {
			throw new Error( 'One or more fields has not been set. Required fields: [userId, productId, productName, cost, amountAvailable]' )
		}

		// Ensure the cost amount is valid
		if ( [5, 10, 20, 50, 100].indexOf( cost ) === -1 ) {
			throw new Error( 'The cost amount has to be one of 5, 10, 20, 50, or 100 cent coins' )
		}

		// Update product
		const ModelProduct = ProductModel()
		// ModelProduct.sync()
		const productUpdate = await ModelProduct.update( {
			productName,
			cost,
			amountAvailable,
		}, {
			where: { productId, sellerId: userId },
			returning: true,
		} )

		if ( !productUpdate[0] ) {
			throw new Error( 'The product was not updated. The productId may not exist or the product does not belong to you.' )
		}

		const product = await ModelProduct.findOne( {
			where: { productId, deletedAt: null }
		} )

		return {
			error: false,
			message: 'The product has been updated successfully',
			status: 200,
			data: product || null,
		}

	} catch ( error ) {
		return {
			error: true,
			message: error.message || 'There was an internal server error',
			status: 500
		}
	}
}

// NOTE: Only the owner of the product should be able to update product
export const updateProductName = async ( userId, productId, productName ) => {
	try {
		await syncDatabase()
		// All fields are required.
		if ( !userId || !productId || !productName ) {
			throw new Error( 'One or more fields has not been set. Required fields: [userId, productId, productName]' )
		}
		// Update product
		const ModelProduct = ProductModel()
		// ModelProduct.sync()
		await ModelProduct.update( {
			productName,
		}, {
			where: { productId, sellerId: userId, deletedAt: null },
		} )

		const product = await ModelProduct.findOne( {
			where: { productId, deletedAt: null }
		} )

		return {
			error: false,
			message: 'Product name updated',
			status: 200,
			data: product || null,
		}

	} catch ( error ) {
		return {
			error: true,
			message: error.message || 'There was an internal server error',
			status: 500
		}
	}
}

// NOTE: Only the owner of the product should be able to update product
export const updateProductCost = async ( userId, productId, cost ) => {
	try {
		await syncDatabase()
		// All fields are required.
		if ( !userId || !productId || !cost ) {
			throw new Error( 'One or more fields has not been set. Required fields: [userId, productId, cost]' )
		}

		// Ensure the cost amount is valid
		if ( cost % 5 !== 0 ) {
			throw new Error( 'The cost amount has to be a multiple of 5' )
		}

		// Update product
		const ModelProduct = ProductModel()
		// ModelProduct.sync()
		await ModelProduct.update( {
			cost,
		}, {
			where: { productId, sellerId: userId, },
		} )

		const product = await ModelProduct.findOne( {
			where: { productId, deletedAt: null }
		} )

		return {
			error: false,
			message: 'Product cost updated',
			status: 200,
			data: product || null,
		}

	} catch ( error ) {
		return {
			error: true,
			message: error.message || 'There was an internal server error',
			status: 500
		}
	}
}

// NOTE: Only the owner of the product should be able to update product
export const updateProductStock = async ( userId, productId, amountAvailable ) => {
	try {
		await syncDatabase()
		// All fields are required.
		if ( !userId || !productId || !amountAvailable ) {
			throw new Error( 'One or more fields has not been set. Required fields: [userId, productId, amountAvailable]' )
		}

		// Update product
		const ModelProduct = ProductModel()
		// ModelProduct.sync()
		await ModelProduct.update( {
			amountAvailable,
		}, {
			where: { productId },
		} )

		const product = await ModelProduct.findOne( {
			where: { productId, deletedAt: null }
		} )

		return {
			error: false,
			message: 'Product stock updated',
			status: 200,
			data: product || null,
		}

	} catch ( error ) {
		return {
			error: true,
			message: error.message || 'There was an internal server error',
			status: 500
		}
	}
}

// NOTE: Only the owner of the product should be able to transfer ownership
export const transferProductOwnership = async ( userId, productId, newSellerId ) => {
	try {
		await syncDatabase()
		// All fields are required.
		if ( !userId || !productId || !newSellerId ) {
			throw new Error( 'One or more fields has not been set. Required fields: [userId, productId, newSellerId]' )
		}

		// Update product
		const ModelProduct = ProductModel()
		// ModelProduct.sync()
		await ModelProduct.update( {
			sellerId: newSellerId,
		}, {
			where: { productId, sellerId: userId },
		} )

		const product = await ModelProduct.findOne( {
			where: { productId, deletedAt: null }
		} )

		return {
			error: false,
			message: `The product now belongs to user with ID '${newSellerId}'`,
			status: 200,
			data: product || null,
		}

	} catch ( error ) {
		return {
			error: true,
			message: error.message || 'There was an internal server error',
			status: 500
		}
	}
}

// NOTE: Only the owner of the product should be able to remove product
export const removeProduct = async ( userId, productId ) => {
	try {
		await syncDatabase()
		// All fields are required.
		if ( !userId || !productId ) {
			throw new Error( 'One or more fields has not been set. Required fields: [userId, productId]' )
		}

		// Remove product
		const ModelProduct = ProductModel()
		// ModelProduct.sync()
		const deleted = await ModelProduct.destroy( {
			where: { productId, sellerId: userId },
		} )

		if ( !deleted ) {
			throw new Error( 'The product was not removed. The productId may not exist or the product does not belong to you.' )
		}

		return {
			error: false,
			message: 'Product removed successfully',
			status: 200,
		}

	} catch ( error ) {
		return {
			error: true,
			message: error.message || 'There was an internal server error',
			status: 500
		}
	}
}

// NOTE: Only the owner of the product should be able to restore product
export const restoreProduct = async ( userId, productId ) => {
	try {
		await syncDatabase()
		// All fields are required.
		if ( !userId || !productId ) {
			throw new Error( 'One or more fields has not been set. Required fields: [userId, productId]' )
		}

		// Remove product
		const ModelProduct = ProductModel()
		// ModelProduct.sync()
		const restored = await ModelProduct.restore( {
			where: { productId, sellerId: userId },
		} )

		if ( !restored ) {
			throw new Error( 'The product was not restored. The productId may not exist or the product does not belong to you.' )
		}

		return {
			error: false,
			message: 'Product restored successfully',
			status: 200,
		}

	} catch ( error ) {
		return {
			error: true,
			message: error.message || 'There was an internal server error',
			status: 500
		}
	}
}

export const createProduct = async ( userId, productName, cost, amountAvailable ) => {
	try {
		await syncDatabase()
		// All fields are required.
		if ( !userId || !productName || !cost || !amountAvailable ) {
			throw new Error( 'One or more fields has not been set. Required fields: [userId, productName, cost, amountAvailable]' )
		}
		// Ensure the cost amount is valid
		if ( [5, 10, 20, 50, 100].indexOf( cost ) === -1 ) {
			throw new Error( 'The cost amount has to be one of 5, 10, 20, 50, or 100 cent coins' )
		}

		// Ensure that the seller exists
		const ModelUser = UserModel()
		// ModelUser.sync()
		const seller = await ModelUser.findOne( {
			attributes: ['refId'],
			where: { refId: userId, deletedAt: null },
		} )
		if ( !( seller instanceof ModelUser ) || !seller ) {
			throw new Error( `Seller with ID '${userId}' not found. Cannot create product` )
		}

		// Create product
		const ModelProduct = ProductModel()
		// ModelProduct.sync()
		const product = await ModelProduct.create( {
			sellerId: userId,
			productName,
			cost,
			amountAvailable,
		}, {
			returning: true,
		} )

		return {
			error: false,
			message: 'Product created successfully',
			status: 201,
			data: product,
		}

	} catch ( error ) {
		return {
			error: true,
			message: error.message || 'There was an internal server error',
			status: 500
		}
	}
}
