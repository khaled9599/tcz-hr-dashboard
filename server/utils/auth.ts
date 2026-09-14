import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'
import { SignJWT, jwtVerify } from 'jose'
import { and, eq, gt } from 'drizzle-orm'
import { sessions, users, userClients } from '../db/schema'
import { useDatabase } from '../db'
import { isDemoMode } from './runtime'

const hash = (value: string) => createHash('sha256').update(value).digest('hex')

function secureRequest(event: any) {
  return getHeader(event, 'x-forwarded-proto') === 'https' || getRequestURL(event).protocol === 'https:'
}

function cookieName(event: any) {
  return secureRequest(event) ? '__Host-tcz_session' : 'tcz_session'
}

function cookieOptions(event: any, maxAge = 60 * 60 * 8) {
  return { httpOnly: true, secure: secureRequest(event), sameSite: 'lax' as const, path: '/', maxAge }
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  clientId: string
}

export async function createSession(event: any, user: AuthUser) {
  const config = useRuntimeConfig(event)
  if (!config.sessionSecret || String(config.sessionSecret).length < 32) throw createError({ statusCode: 503, statusMessage: 'Session security is not configured.' })

  if (isDemoMode(config)) {
    const token = await new SignJWT(user as unknown as Record<string, unknown>)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('8h')
      .sign(new TextEncoder().encode(config.sessionSecret))
    setCookie(event, cookieName(event), token, cookieOptions(event))
    return
  }

  const raw = randomBytes(32).toString('base64url')
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  await useDatabase().insert(sessions).values({
    id: randomUUID(), userId: user.id, tokenHash: hash(raw), expiresAt, lastSeenAt: now,
    userAgent: getHeader(event, 'user-agent')?.slice(0, 500), ipHash: hash(getRequestIP(event, { xForwardedFor: true }) || 'unknown')
  })
  setCookie(event, cookieName(event), raw, cookieOptions(event))
}

export async function getAuthUser(event: any): Promise<AuthUser | null> {
  const config = useRuntimeConfig(event)
  const token = getCookie(event, cookieName(event))
  if (!token) return null

  if (isDemoMode(config)) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(config.sessionSecret))
      return payload as unknown as AuthUser
    } catch { return null }
  }

  const rows = await useDatabase()
    .select({ id: users.id, email: users.email, name: users.name, role: users.role, clientId: userClients.clientId })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .innerJoin(userClients, eq(users.id, userClients.userId))
    .where(and(eq(sessions.tokenHash, hash(token)), gt(sessions.expiresAt, new Date())))
    .limit(1)
  return rows[0] || null
}

export async function requireAuth(event: any) {
  const user = await getAuthUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Please sign in to continue.' })
  return user
}

export async function destroySession(event: any) {
  const config = useRuntimeConfig(event)
  const name = cookieName(event)
  const token = getCookie(event, name)
  if (token && !isDemoMode(config)) await useDatabase().delete(sessions).where(eq(sessions.tokenHash, hash(token)))
  deleteCookie(event, name, cookieOptions(event, 0))
}

export function safeEqual(left: string, right: string) {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}
