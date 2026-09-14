export type MetricKey = 'spend' | 'leads' | 'cpl' | 'qualifiedLeads' | 'cpql' | 'clicks' | 'ctr' | 'cpc' | 'cpm'
export type LeadStatus = 'New' | 'Contacted' | 'No Answer' | 'Interested' | 'Follow Up' | 'Qualified' | 'Not Qualified' | 'Converted' | 'Duplicate' | 'Invalid'

export interface DateScope {
  preset: string
  start: string
  end: string
}

export interface Metric {
  key: string
  label: string
  value: number
  previous: number
  change: number | null
  format: 'number' | 'currency' | 'percent' | 'decimal'
  primary?: boolean
  invertTrend?: boolean
}

export interface TrendPoint {
  date: string
  spend: number
  leads: number
  cpl: number
  qualifiedLeads: number
  cpql: number
  clicks: number
  ctr: number
  cpc: number
  cpm: number
}

export interface Campaign {
  id: string
  name: string
  status: 'Active' | 'Paused' | 'Completed'
  platform: 'Meta' | 'Google' | 'TikTok'
  objective: string
  startDate: string
  endDate: string | null
  spend: number
  reach: number
  impressions: number
  clicks: number
  linkClicks: number
  leads: number
  qualifiedLeads: number
  conversions: number
}

export interface Lead {
  id: string
  submittedAt: string
  name: string
  phone: string
  email: string
  campaignId: string | null
  campaign: string
  platform: string
  source: string
  form: string
  location: string
  status: LeadStatus
  qualificationStatus: 'Qualified' | 'Not Qualified' | 'Pending'
  customFields?: Record<string, unknown>
}

export interface DashboardPayload {
  scope: DateScope
  lastSyncAt: string | null
  metrics: Metric[]
  secondaryMetrics: Metric[]
  trend: TrendPoint[]
  campaigns: Array<Campaign & { cpl: number, cpql: number, ctr: number, cpc: number, cpm: number, frequency: number, conversionRate: number, qualificationRate: number }>
}

export interface SyncLog {
  id: string
  startedAt: string
  endedAt: string | null
  source: string
  rowsChecked: number
  created: number
  updated: number
  duplicates: number
  failed: number
  status: 'Success' | 'Partial' | 'Failed'
  errorMessage?: string | null
}
