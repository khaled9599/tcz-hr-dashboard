import { describe, expect, it } from 'vitest'
import { calculateMetrics, normalizeCampaignName, percentChange, safeDivide } from '../server/domain/analytics'

describe('analytics calculations', () => {
  it('uses one consistent set of media and lead formulas', () => {
    const result = calculateMetrics({ spend: 1000, reach: 400, impressions: 1000, clicks: 50, leads: 10, qualifiedLeads: 4, conversions: 2 })
    expect(result.cpl).toBe(100)
    expect(result.cpql).toBe(250)
    expect(result.conversionRate).toBe(20)
    expect(result.ctr).toBe(5)
    expect(result.cpc).toBe(20)
    expect(result.cpm).toBe(1000)
    expect(result.frequency).toBe(2.5)
  })

  it('handles zero denominators without NaN or Infinity', () => {
    expect(safeDivide(200, 0)).toBe(0)
    const result = calculateMetrics({ spend: 200, reach: 0, impressions: 0, clicks: 0, leads: 0, qualifiedLeads: 0, conversions: 0 })
    expect(Object.values(result).every(value => Number.isFinite(value))).toBe(true)
  })

  it('represents undefined growth from a zero previous period honestly', () => {
    expect(percentChange(10, 0)).toBeNull()
    expect(percentChange(0, 0)).toBe(0)
  })

  it('normalizes campaign labels for safe fallback matching', () => {
    expect(normalizeCampaignName('  KOG — Summer_Homes  ')).toBe('kog summer homes')
  })
})
