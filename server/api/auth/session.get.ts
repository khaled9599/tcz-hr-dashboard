import { getAuthUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getAuthUser(event)
  return { authenticated: Boolean(user), user: user ? { name: user.name, email: user.email, role: user.role, clientId: user.clientId } : null }
})
