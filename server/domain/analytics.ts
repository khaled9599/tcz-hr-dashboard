export interface RawTotals {
  spend: number
  reach: number
  impressions: number
  clicks: number
  linkClicks?: number
  leads: number
  qualifiedLeads: number
  conversions: number
}

export const safeDivide = (numerator: number, denominator: number) => denominator > 0 ? numerator / denominator : 0

export function calculateMetrics<T extends RawTotals>(totals: T) {
  return {
    ...totals,
    cpl: safeDivide(totals.spend, totals.leads),
    cpql: safeDivide(totals.spend, totals.qualifiedLeads),
    conversionRate: safeDivide(totals.conversions, totals.leads) * 100,
    qualificationRate: safeDivide(totals.qualifiedLeads, totals.leads) * 100,
    ctr: safeDivide(totals.clicks, totals.impressions) * 100,
    cpc: safeDivide(totals.spend, totals.clicks),
    cpm: safeDivide(totals.spend, totals.impressions) * 1000,
    frequency: safeDivide(totals.impressions, totals.reach)
  }
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return ((current - previous) / previous) * 100
}

export function normalizeCampaignName(value: string) {
  return value.normalize('NFKC').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ')
}

export function sumTotals<T extends RawTotals>(records: T[]): RawTotals {
  return records.reduce((sum, row) => ({
    spend: sum.spend + row.spend,
    reach: sum.reach + row.reach,
    impressions: sum.impressions + row.impressions,
    clicks: sum.clicks + row.clicks,
    linkClicks: (sum.linkClicks || 0) + (row.linkClicks || 0),
    leads: sum.leads + row.leads,
    qualifiedLeads: sum.qualifiedLeads + row.qualifiedLeads,
    conversions: sum.conversions + row.conversions
  }), { spend: 0, reach: 0, impressions: 0, clicks: 0, linkClicks: 0, leads: 0, qualifiedLeads: 0, conversions: 0 })
}
