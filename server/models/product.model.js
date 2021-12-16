import { database } from '../database/db'
import ProductSchema from '../schema/product.schema'

export const ProductModel = () => {
	const Product = database.define( 'product', ProductSchema, {
		paranoid: true,
	} )

	return Product
}
