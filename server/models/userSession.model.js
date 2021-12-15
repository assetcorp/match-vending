import { database } from '../database/db'
import UserSessionSchema from '../schema/userSession.schema'

export const UserSessionModel = () => {

	const UserSession = database.define( 'userSession', UserSessionSchema )

	return UserSession
}
