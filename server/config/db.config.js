const envProcess = process.env

export default {
  HOST: envProcess.DB_HOST,
  USER: envProcess.DB_USER,
  PASSWORD: envProcess.DB_PASSWORD,
  DB: envProcess.DB_NAME,
  dialect: envProcess.DB_DIALECT,
  pool: {
    max: parseInt( envProcess.DB_POOL_MAX ),
    min: parseInt( envProcess.DB_POOL_MIN ),
    acquire: parseInt( envProcess.DB_POOL_ACQUIRE ),
    idle: parseInt( envProcess.DB_POOL_IDLE ),
  }
}