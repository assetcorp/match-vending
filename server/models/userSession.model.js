import UserSessionSchema from '../schema/userSession.schema'
import Database from '.'

export const UserSessionModel = () => {

	const UserSession = Database.connection.define( 'userSession', UserSessionSchema )

	return UserSession
}
