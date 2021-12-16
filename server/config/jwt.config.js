const envProcess = process.env

export default {
  secret: envProcess.JWT_SECRET
}