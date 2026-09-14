import { demoCampaigns, demoLeads } from '../data/demo'
import { safeDivide } from '../domain/analytics'
import { requireAuth } from '../utils/auth'
import { loadLeadAnalysis, resolveDateRange } from '../repositories/application'
import { isDemoMode } from '../utils/runtime'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const config = useRuntimeConfig(event)
  if (!isDemoMode(config)) return loadLeadAnalysis(user.clientId, resolveDateRange(getQuery(event)))
  const leads = demoLeads()
  const countStatus = (status: string) => leads.filter(row => row.status === status).length
  const qualified = leads.filter(row => row.qualificationStatus === 'Qualified').length
  const invalid = countStatus('Invalid')
  const duplicates = countStatus('Duplicate')
  const converted = countStatus('Converted')
  const valid = leads.length - invalid - duplicates
  const totalSpend = demoCampaigns.reduce((sum, row) => sum + row.spend, 0)
  const byCampaign = demoCampaigns.map(row => ({ name: row.name, leads: row.leads, qualifiedLeads: row.qualifiedLeads, qualificationRate: safeDivide(row.qualifiedLeads, row.leads) * 100, spend: row.spend }))
  const group = (field: 'platform' | 'location' | 'status' | 'qualificationStatus') => Object.entries(leads.reduce<Record<string, number>>((sum, row) => { const key = String(row[field]); sum[key] = (sum[key] || 0) + 1; return sum }, {})).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  const byHour = Array.from({ length: 24 }, (_, hour) => ({ hour, value: leads.filter(row => new Date(row.submittedAt).getUTCHours() === hour).length }))
  return {
    metrics: { total: leads.length, valid, invalid, duplicates, qualified, converted, qualificationRate: safeDivide(qualified, valid) * 100, conversionRate: safeDivide(converted, valid) * 100, cpql: safeDivide(totalSpend, qualified) },
    byCampaign, byPlatform: group('platform'), byLocation: group('location'), byStatus: group('status'), byQualification: group('qualificationStatus'), byHour
  }
})
