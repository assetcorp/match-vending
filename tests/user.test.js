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

describe( 'Users', () => {
	it( 'should create a new user', async () => {
		const user = await createUser()

		expect( user.status ).toEqual( 201 )
		expect( user.body ).toHaveProperty( 'data' )
	} )
} )
