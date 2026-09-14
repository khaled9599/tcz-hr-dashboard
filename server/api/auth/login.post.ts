import { compare } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { users, userClients } from '../../db/schema'
import { useDatabase } from '../../db'
import { createSession, safeEqual } from '../../utils/auth'
import { isDemoMode } from '../../utils/runtime'

const schema = z.object({ email: z.email().transform(value => value.trim().toLowerCase()), password: z.string().min(8).max(128) })

export default defineEventHandler(async (event) => {
  const input = schema.parse(await readBody(event))
  const config = useRuntimeConfig(event)
  let user

  if (isDemoMode(config)) {
    if (!config.demoUserEmail || !config.demoUserPassword || !safeEqual(input.email, String(config.demoUserEmail).toLowerCase()) || !safeEqual(input.password, String(config.demoUserPassword))) {
      throw createError({ statusCode: 401, statusMessage: 'Email or password is incorrect.' })
    }
    user = { id: 'demo-user', email: input.email, name: 'KOG Client', role: 'client_viewer', clientId: 'kog-demo' }
  } else {
    const rows = await useDatabase().select({
      id: users.id, email: users.email, name: users.name, role: users.role,
      passwordHash: users.passwordHash, disabledAt: users.disabledAt, clientId: userClients.clientId
    }).from(users).innerJoin(userClients, eq(users.id, userClients.userId)).where(eq(users.email, input.email)).limit(1)
    const account = rows[0]
    if (!account || account.disabledAt || !(await compare(input.password, account.passwordHash))) throw createError({ statusCode: 401, statusMessage: 'Email or password is incorrect.' })
    user = account
  }

  await createSession(event, user)
  return { authenticated: true, user: { name: user.name, email: user.email, role: user.role, clientId: user.clientId } }
})
