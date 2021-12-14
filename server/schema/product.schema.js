import { DataTypes } from 'sequelize'

export default {
	productId: {
		type: DataTypes.UUID,
		allowNull: false,
		unique: true,
		defaultValue: DataTypes.UUIDV4,
	},
	productName: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	sellerId: {
		type: DataTypes.UUID,
		allowNull: false,
	},
	cost: {
		type: DataTypes.INTEGER,
		allowNull: false,
		validate: {
			isNumeric: true,
			isIn: [[5, 10, 20, 50, 100]],
		}
	},
	amountAvailable: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0,
	},
}
