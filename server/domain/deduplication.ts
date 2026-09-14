import { createHash } from 'node:crypto'

export interface LeadIdentity {
  sourceId?: string | null
  phone?: string | null
  email?: string | null
  submittedAt: string | Date
  form?: string | null
  campaign?: string | null
}

const clean = (value?: string | null) => (value || '').trim().toLowerCase().replace(/\s+/g, ' ')
const cleanPhone = (value?: string | null) => clean(value).replace(/[^0-9+]/g, '')
const sha = (value: string) => createHash('sha256').update(value).digest('hex')

export function buildDedupeKey(lead: LeadIdentity) {
  if (lead.sourceId) return sha(`source:${clean(lead.sourceId)}`)
  const timestamp = new Date(lead.submittedAt)
  if (Number.isNaN(timestamp.getTime())) throw new Error('A valid submission timestamp is required for deduplication.')
  const minute = timestamp.toISOString().slice(0, 16)
  const contact = cleanPhone(lead.phone) || clean(lead.email)
  if (!contact) throw new Error('Phone or email is required when no source lead ID exists.')
  return sha([contact, minute, clean(lead.form), clean(lead.campaign)].join('|'))
}

export function buildRowHash(row: Record<string, unknown>) {
  const stable = Object.keys(row).sort().map(key => `${key}:${String(row[key] ?? '').trim()}`).join('|')
  return sha(stable)
}

export function classifyRow(existingHash: string | null | undefined, incomingHash: string) {
  if (!existingHash) return 'insert' as const
  return existingHash === incomingHash ? 'duplicate' as const : 'update' as const
}
