import { demoCampaigns, demoTrend } from '../data/demo'
import { calculateMetrics, percentChange, sumTotals } from '../domain/analytics'
import { requireAuth } from '../utils/auth'
import { loadDashboard, resolveDateRange } from '../repositories/application'
import { isDemoMode } from '../utils/runtime'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const config = useRuntimeConfig(event)
  if (!isDemoMode(config)) return loadDashboard(user.clientId, resolveDateRange(getQuery(event)))
  const current = calculateMetrics(sumTotals(demoCampaigns))
  const previous = calculateMetrics({ spend: 810000, reach: 2510000, impressions: 4520000, clicks: 69200, linkClicks: 60100, leads: 1082, qualifiedLeads: 497, conversions: 119 })
  const metric = (key: string, label: string, value: number, previousValue: number, format: any, primary = false, invertTrend = false) => ({ key, label, value, previous: previousValue, change: percentChange(value, previousValue), format, primary, invertTrend })
  return {
    scope: getQuery(event),
    lastSyncAt: '2026-09-14T10:30:18Z',
    metrics: [
      metric('leads', 'Leads Submitted', current.leads, previous.leads, 'number', true),
      metric('spend', 'Total Spend', current.spend, previous.spend, 'currency'),
      metric('cpl', 'Cost Per Lead', current.cpl, previous.cpl, 'currency', false, true),
      metric('qualifiedLeads', 'Qualified Leads', current.qualifiedLeads, previous.qualifiedLeads, 'number'),
      metric('cpql', 'Cost Per Qualified Lead', current.cpql, previous.cpql, 'currency', false, true),
      metric('conversionRate', 'Conversion Rate', current.conversionRate, previous.conversionRate, 'percent')
    ],
    secondaryMetrics: [
      metric('impressions', 'Impressions', current.impressions, previous.impressions, 'number'),
      metric('reach', 'Reach', current.reach, previous.reach, 'number'),
      metric('clicks', 'Clicks', current.clicks, previous.clicks, 'number'),
      metric('ctr', 'CTR', current.ctr, previous.ctr, 'percent'),
      metric('cpc', 'CPC', current.cpc, previous.cpc, 'currency', false, true),
      metric('cpm', 'CPM', current.cpm, previous.cpm, 'currency', false, true),
      metric('frequency', 'Frequency', current.frequency, previous.frequency, 'decimal')
    ],
    trend: demoTrend(),
    campaigns: demoCampaigns.map(campaign => ({ ...campaign, ...calculateMetrics(campaign) }))
  }
})
