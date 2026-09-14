import { describe, expect, it } from 'vitest'
import { demoCampaigns, demoLeads } from '../server/data/demo'

describe('representative large dataset', () => {
  it('keeps lead and campaign totals internally consistent', () => {
    expect(demoLeads()).toHaveLength(demoCampaigns.reduce((sum, row) => sum + row.leads, 0))
  })

  it('contains all qualification edge states', () => {
    const values = new Set(demoLeads().map(row => row.qualificationStatus))
    expect(values).toEqual(new Set(['Qualified', 'Not Qualified', 'Pending']))
  })
})
