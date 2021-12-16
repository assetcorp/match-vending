const envProcess = process.env

export default {
  WHITELIST_DOMAINS: JSON.parse( envProcess.WHITELIST_DOMAINS || '[]' )
}