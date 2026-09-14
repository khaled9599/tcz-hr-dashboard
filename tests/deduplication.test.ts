import { describe, expect, it } from 'vitest'
import { buildDedupeKey, buildRowHash, classifyRow } from '../server/domain/deduplication'

describe('lead deduplication', () => {
  const base = { phone: '+20 100 123 4567', email: 'person@example.com', submittedAt: '2026-09-14T10:30:15Z', form: 'KOG inquiry', campaign: 'Summer Homes' }

  it('prefers a stable source ID', () => {
    expect(buildDedupeKey({ ...base, sourceId: 'META-42' })).toBe(buildDedupeKey({ ...base, sourceId: 'META-42', phone: 'changed' }))
  })

  it('keeps status changes attached to the same fallback identity', () => {
    expect(buildDedupeKey(base)).toBe(buildDedupeKey({ ...base }))
    expect(buildRowHash({ ...base, status: 'New' })).not.toBe(buildRowHash({ ...base, status: 'Qualified' }))
  })

  it('does not merge submissions at different times', () => {
    expect(buildDedupeKey(base)).not.toBe(buildDedupeKey({ ...base, submittedAt: '2026-09-14T10:32:15Z' }))
  })

  it('classifies insert, unchanged duplicate, and update', () => {
    expect(classifyRow(null, 'a')).toBe('insert')
    expect(classifyRow('a', 'a')).toBe('duplicate')
    expect(classifyRow('a', 'b')).toBe('update')
  })
})
