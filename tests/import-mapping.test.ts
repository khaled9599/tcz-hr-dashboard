import { describe, expect, it } from 'vitest'
import { mapLeadRow } from '../server/services/leads'
import { mapMediaRow } from '../server/services/media'

describe('import mapping', () => {
  it('maps common Google and Meta lead headings and preserves custom fields', () => {
    const lead = mapLeadRow({ 'Lead ID': 'L-1', 'Created Time': '2026-09-14T10:30:00Z', 'Full Name': 'Demo Person', 'Mobile': '+20100', 'Campaign Name': 'KOG Campaign', 'Qualified': 'Yes', 'Bedrooms': '3' }, 2)
    expect(lead.sourceId).toBe('L-1')
    expect(lead.qualificationStatus).toBe('Qualified')
    expect(lead.customFields).toEqual({ bedrooms: '3' })
  })

  it('rejects leads without a valid timestamp or contact', () => {
    expect(() => mapLeadRow({ Date: 'not-a-date', Name: 'Demo' })).toThrow('submission date')
    expect(() => mapLeadRow({ Date: '2026-09-14' })).toThrow('phone number or email')
  })

  it('normalizes common media export headings', () => {
    const media = mapMediaRow({ 'Day': '2026-09-14', 'Campaign Name': 'Launch', 'Amount Spent': '12,500.50', 'Impressions': '100000', 'All Clicks': '1400', 'Results': '52' })
    expect(media.spend).toBe(12500.5)
    expect(media.clicks).toBe(1400)
    expect(media.leads).toBe(52)
  })
})
