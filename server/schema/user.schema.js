import { DataTypes } from 'sequelize'

export default {
	refId: {
		type: DataTypes.UUID,
		allowNull: false,
		unique: true,
		defaultValue: DataTypes.UUIDV4,
	},
	username: {
		type: DataTypes.STRING,
		set: function ( value ) {
			return this.setDataValue( 'username', value.toLowerCase() )
		},
		unique: true,
		allowNull: false,
		comment: 'The username of the user',
		validate: {
			notEmpty: true,
		}
	},
	password: {
		type: DataTypes.STRING,
		get: function () {
			return () => this.getDataValue( 'password' )
		}, // We return a function so this would not be included in results
	},
	passwordSalt: {
		type: DataTypes.STRING,
		get: function () {
			return () => this.getDataValue( 'passwordSalt' )
		}, // We return a function so this would not be included in results
	},
	deposit: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0,
		validate: {
			isNumeric: true,
			isIn: [[5, 10, 20, 50, 100]],
		}
	},
	role: {
		type: DataTypes.ENUM( ['buyer', 'seller'] ),
		default: 'buyer',
	}
}
