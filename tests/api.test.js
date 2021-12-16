/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const req = require( 'supertest' )
const request = req( 'http://localhost:3000/api/v1' )

const createUser = async () => {
	return await request
		.post( '/user' )
		.send( {
			username: 'del',
			password: 'deldeldel',
		} )
}

const deposit = async ( token ) => {
	return await request
		.put( '/deposit' )
		.set( 'Authorization', `Bearer ${token}` )
		.send( {
			amount: 100,
		} )
}

const buy = async ( token, productId ) => {
	return await request
		.post( '/buy' )
		.set( 'Authorization', `Bearer ${token}` )
		.send( {
			productId: productId,
			units: 2
		} )
}

const updateUserRole = async ( token, role ) => {
	return await request
		.patch( '/user' )
		.set( 'Authorization', `Bearer ${token}` )
		.send( {
			role,
		} )
}

const createProduct = async ( token ) => {
	return await request
		.post( '/product' )
		.set( 'Authorization', `Bearer ${token}` )
		.send( {
			productName: 'Book',
			cost: 10,
			amountAvailable: 20,
		} )
}

describe( 'Users', () => {
	let userData = null
	let userToken = ''
	let productId = ''

	it( 'should create a new user', async () => {
		const user = await createUser()

		userToken = user.body.data.token
		expect( user.status ).toEqual( 201 )
		expect( user.body ).toHaveProperty( 'data' )
		expect( user.body.data ).toHaveProperty( 'token' )
	} )

	it( 'should deposit funds', async () => {
		const user = await deposit( userToken )

		userData = user.body
		expect( user.status ).toEqual( 200 )
		expect( user.body.data.deposit ).toEqual( 100 )
	} )

	it( 'should make user a seller', async () => {
		const user = await updateUserRole( userToken, 'seller' )

		expect( user.status ).toEqual( 200 )
		expect( user.body.data.role ).toEqual( 'seller' )
	} )

	it( 'should create a new product', async () => {
		const product = await createProduct( userToken )

		if ( product.status === 201 ) {
			productId = product.body.data.productId
		}

		expect( product.status ).toEqual( 201 )
		expect( product.body ).toHaveProperty( 'data' )
	} )

	it( 'should make user a buyer', async () => {
		const user = await updateUserRole( userToken, 'buyer' )

		expect( user.status ).toEqual( 200 )
		expect( user.body.data.role ).toEqual( 'buyer' )
	} )

	it( 'should buy a product', async () => {
		const product = await buy( userToken, productId )

		// userData = user.body
		expect( product.status ).toEqual( 200 )
		expect( product.body.data.change ).toEqual( [50, 20, 10] )
	} )
} )
