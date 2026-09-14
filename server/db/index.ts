import mysql from 'mysql2/promise'
import { drizzle } from 'drizzle-orm/mysql2'
import * as schema from './schema'

let pool: mysql.Pool | undefined

export function useDatabase() {
  const config = useRuntimeConfig()
  if (!config.databaseUrl) throw createError({ statusCode: 503, statusMessage: 'Database is not configured.' })
  pool ||= mysql.createPool({ uri: config.databaseUrl, connectionLimit: 10, enableKeepAlive: true })
  return drizzle({ client: pool, schema, mode: 'default' })
}

export function usePool() {
  useDatabase()
  return pool!
}
