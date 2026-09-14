import { demoCampaigns, campaignWithMetrics, demoTrend } from '../../data/demo'
import { requireAuth } from '../../utils/auth'
import { loadCampaignDetail, resolveDateRange } from '../../repositories/application'
import { isDemoMode } from '../../utils/runtime'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const config = useRuntimeConfig(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Campaign ID is required.' })
  if (!isDemoMode(config)) {
    const result = await loadCampaignDetail(user.clientId, id, resolveDateRange(getQuery(event)))
    if (!result) throw createError({ statusCode: 404, statusMessage: 'Campaign not found.' })
    return result
  }
  const campaign = demoCampaigns.find(row => row.id === id)
  if (!campaign) throw createError({ statusCode: 404, statusMessage: 'Campaign not found.' })
  const share = campaign.leads / demoCampaigns.reduce((sum, row) => sum + row.leads, 0)
  return { campaign: campaignWithMetrics(campaign), trend: demoTrend().map(row => ({ ...row, spend: row.spend * share, leads: Math.round(row.leads * share), qualifiedLeads: Math.round(row.qualifiedLeads * share) })), adSets: [] }
})
