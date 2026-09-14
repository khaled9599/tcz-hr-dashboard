import type { Campaign, Lead, SyncLog, TrendPoint } from '../../app/types/dashboard'
import { calculateMetrics } from '../domain/analytics'

export const demoCampaigns: Campaign[] = [
  { id: 'cmp-01', name: 'New Cairo Summer Homes', status: 'Active', platform: 'Meta', objective: 'Lead generation', startDate: '2026-08-01', endDate: null, spend: 235000, reach: 784000, impressions: 1324000, clicks: 19620, linkClicks: 17200, leads: 342, qualifiedLeads: 170, conversions: 36 },
  { id: 'cmp-02', name: 'Gardens Launch', status: 'Active', platform: 'Meta', objective: 'Lead generation', startDate: '2026-08-10', endDate: null, spend: 192000, reach: 611000, impressions: 1035000, clicks: 15100, linkClicks: 13210, leads: 298, qualifiedLeads: 149, conversions: 31 },
  { id: 'cmp-03', name: 'Sahel Waterfront', status: 'Active', platform: 'Meta', objective: 'Lead generation', startDate: '2026-07-15', endDate: null, spend: 181000, reach: 704000, impressions: 1210000, clicks: 14100, linkClicks: 11820, leads: 215, qualifiedLeads: 78, conversions: 17 },
  { id: 'cmp-04', name: 'Family Living Retargeting', status: 'Active', platform: 'Meta', objective: 'Conversions', startDate: '2026-08-18', endDate: null, spend: 82000, reach: 208000, impressions: 512000, clicks: 11080, linkClicks: 9970, leads: 173, qualifiedLeads: 96, conversions: 29 },
  { id: 'cmp-05', name: 'KOG Brand Search', status: 'Active', platform: 'Google', objective: 'Leads', startDate: '2026-08-01', endDate: null, spend: 73000, reach: 112000, impressions: 203000, clicks: 8220, linkClicks: 7800, leads: 151, qualifiedLeads: 91, conversions: 23 },
  { id: 'cmp-06', name: 'Broad Prospecting Test', status: 'Paused', platform: 'Meta', objective: 'Lead generation', startDate: '2026-08-20', endDate: '2026-09-12', spend: 119000, reach: 466000, impressions: 816000, clicks: 9100, linkClicks: 7460, leads: 105, qualifiedLeads: 27, conversions: 7 }
]

const statuses = ['New', 'Contacted', 'No Answer', 'Interested', 'Follow Up', 'Qualified', 'Not Qualified', 'Converted', 'Duplicate', 'Invalid'] as const
const locations = ['New Cairo', 'Sheikh Zayed', 'Nasr City', 'Maadi', 'Alexandria', 'North Coast']

export function demoLeads(now = new Date()): Lead[] {
  const output: Lead[] = []
  let cursor = 0
  for (const campaign of demoCampaigns) {
    for (let i = 0; i < campaign.leads; i++) {
      const qualified = i < campaign.qualifiedLeads
      const converted = i < campaign.conversions
      const dayOffset = cursor % 30
      const date = new Date(now)
      date.setUTCDate(now.getUTCDate() - dayOffset)
      date.setUTCHours(8 + (cursor * 7) % 13, (cursor * 11) % 60, 0, 0)
      const status = converted ? 'Converted' : qualified ? (i % 3 === 0 ? 'Qualified' : 'Interested') : statuses[(cursor * 3) % statuses.length]
      output.push({
        id: `KOG-${String(cursor + 1).padStart(5, '0')}`,
        submittedAt: date.toISOString(),
        name: `Demo Lead ${String(cursor + 1).padStart(4, '0')}`,
        phone: `+20 10 *** ${String(1000 + (cursor % 9000)).slice(-4)}`,
        email: `lead${cursor + 1}@demo.invalid`,
        campaignId: campaign.id,
        campaign: campaign.name,
        platform: campaign.platform,
        source: campaign.platform === 'Google' ? 'Paid Search' : 'Paid Social',
        form: campaign.platform === 'Google' ? 'Website inquiry' : 'Instant form',
        location: locations[cursor % locations.length]!,
        status: status!,
        qualificationStatus: qualified ? 'Qualified' : status === 'Invalid' || status === 'Not Qualified' ? 'Not Qualified' : 'Pending',
        customFields: { preferredUnit: cursor % 2 ? 'Apartment' : 'Villa', language: cursor % 3 ? 'Arabic' : 'English' }
      })
      cursor++
    }
  }
  return output.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
}

export function demoTrend(now = new Date()): TrendPoint[] {
  const dailyLeads = [38, 41, 35, 47, 40, 36, 44, 49, 39, 46, 45, 37, 42, 50, 43, 36, 48, 41, 39, 47, 52, 45, 38, 44, 49, 42, 37, 46, 51, 45]
  const scale = 1284 / dailyLeads.reduce((a, b) => a + b, 0)
  let assigned = 0
  return dailyLeads.map((base, index) => {
    const leads = index === dailyLeads.length - 1 ? 1284 - assigned : Math.round(base * scale)
    assigned += leads
    const date = new Date(now)
    date.setUTCDate(now.getUTCDate() - (29 - index))
    const spend = Math.round(22500 + ((index * 7919) % 14500))
    const qualifiedLeads = Math.round(leads * (0.37 + (index % 5) * 0.025))
    const clicks = Math.round(spend / (8.2 + (index % 4) * 0.7))
    const impressions = Math.round(clicks / (0.014 + (index % 3) * 0.001) * 100)
    return {
      date: date.toISOString().slice(0, 10), spend, leads,
      cpl: leads ? spend / leads : 0, qualifiedLeads, cpql: qualifiedLeads ? spend / qualifiedLeads : 0,
      clicks, ctr: clicks / impressions * 100, cpc: spend / clicks, cpm: spend / impressions * 1000
    }
  })
}

export const demoSyncLogs: SyncLog[] = [
  { id: 'sync-3', startedAt: '2026-09-14T10:30:00Z', endedAt: '2026-09-14T10:30:18Z', source: 'Google Sheet', rowsChecked: 1284, created: 14, updated: 8, duplicates: 3, failed: 0, status: 'Success' },
  { id: 'sync-2', startedAt: '2026-09-14T10:00:00Z', endedAt: '2026-09-14T10:00:21Z', source: 'Google Sheet', rowsChecked: 1270, created: 11, updated: 4, duplicates: 1, failed: 2, status: 'Partial', errorMessage: 'Two rows were missing a valid submission time.' },
  { id: 'sync-1', startedAt: '2026-09-14T09:30:00Z', endedAt: '2026-09-14T09:30:16Z', source: 'Google Sheet', rowsChecked: 1259, created: 9, updated: 2, duplicates: 0, failed: 0, status: 'Success' }
]

export function campaignWithMetrics(campaign: Campaign) {
  return { ...campaign, ...calculateMetrics(campaign) }
}
