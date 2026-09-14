import { demoCampaigns, campaignWithMetrics } from '../data/demo'
import { requireAuth } from '../utils/auth'
import { loadCampaigns, resolveDateRange } from '../repositories/application'
import { isDemoMode } from '../utils/runtime'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const config = useRuntimeConfig(event)
  const query = getQuery(event)
  const search = String(query.search || '').toLowerCase()
  const platform = String(query.platform || '')
  const status = String(query.status || '')
  if (!isDemoMode(config)) {
    const rows = await loadCampaigns(user.clientId, resolveDateRange(query), { search, platform, status })
    return { rows, total: rows.length }
  }
  const rows = demoCampaigns.filter(row => (!search || row.name.toLowerCase().includes(search)) && (!platform || row.platform === platform) && (!status || row.status === status)).map(campaignWithMetrics)
  return { rows, total: rows.length }
})
