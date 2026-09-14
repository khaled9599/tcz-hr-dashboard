import { safeEqual, getAuthUser } from '../../utils/auth'
import { synchronizeGoogleSheet } from '../../services/google-sheets'
import { isDemoMode } from '../../utils/runtime'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const authHeader = getHeader(event, 'authorization') || ''
  const schedulerAllowed = Boolean(config.syncSecret) && safeEqual(authHeader, `Bearer ${config.syncSecret}`)
  const user = schedulerAllowed ? null : await getAuthUser(event)
  if (!schedulerAllowed && !user) throw createError({ statusCode: 401, statusMessage: 'Authentication is required.' })
  const clientId = user?.clientId || String(getQuery(event).clientId || '')
  if (!clientId) throw createError({ statusCode: 400, statusMessage: 'Client ID is required for scheduled synchronization.' })
  if (isDemoMode(config)) return { checked: 1284, created: 14, updated: 8, duplicates: 3, invalid: 0, status: 'Success', lastSuccessfulAt: new Date() }
  return synchronizeGoogleSheet(clientId)
})
