import ProductSchema from '../schema/product.schema'
import Database from '.'

export const ProductModel = () => {
	const Product = Database.connection.define( 'product', ProductSchema, {
		paranoid: true,
	} )

	return Product
}
