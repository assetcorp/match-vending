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
		allowNull: false,
	},
	sessionId: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	sessionToken: {
		type: DataTypes.STRING,
		allowNull: false,
	},
}
