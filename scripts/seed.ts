import mysql from 'mysql2/promise'
import { hash } from 'bcryptjs'
import { randomUUID } from 'node:crypto'

const databaseUrl = process.env.DATABASE_URL
const email = process.env.INITIAL_KOG_EMAIL?.trim().toLowerCase()
const password = process.env.INITIAL_KOG_PASSWORD
if (!databaseUrl || !email || !password || password.length < 12) throw new Error('Set DATABASE_URL, INITIAL_KOG_EMAIL, and an INITIAL_KOG_PASSWORD of at least 12 characters.')

const connection = await mysql.createConnection(databaseUrl)
try {
  const clientId = randomUUID()
  const userId = randomUUID()
  const passwordHash = await hash(password, 12)
  await connection.beginTransaction()
  await connection.execute('INSERT INTO clients (id, slug, name, timezone, currency, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE name = VALUES(name)', [clientId, 'kog', 'KOG', 'Africa/Cairo', 'EGP'])
  const [clientRows] = await connection.execute<mysql.RowDataPacket[]>('SELECT id FROM clients WHERE slug = ? LIMIT 1', ['kog'])
  const storedClientId = String(clientRows[0]!.id)
  await connection.execute('INSERT INTO users (id, email, name, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), updated_at = NOW()', [userId, email, 'KOG Client', passwordHash, 'client_viewer'])
  const [userRows] = await connection.execute<mysql.RowDataPacket[]>('SELECT id FROM users WHERE email = ? LIMIT 1', [email])
  await connection.execute('INSERT INTO user_clients (user_id, client_id, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE role = VALUES(role)', [String(userRows[0]!.id), storedClientId, 'viewer'])
  await connection.commit()
  console.log(`KOG client and ${email} are ready.`)
} catch (error) {
  await connection.rollback()
  throw error
} finally {
  await connection.end()
}
