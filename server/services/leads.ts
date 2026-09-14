import { randomUUID } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { leads, syncEvents } from '../db/schema'
import { useDatabase } from '../db'
import { buildDedupeKey, buildRowHash, classifyRow } from '../domain/deduplication'

const allowedStatuses = new Set(['New', 'Contacted', 'No Answer', 'Interested', 'Follow Up', 'Qualified', 'Not Qualified', 'Converted', 'Duplicate', 'Invalid'])

export interface NormalizedLead {
  sourceId?: string | null
  submittedAt: Date
  name?: string | null
  phone?: string | null
  email?: string | null
  campaign?: string | null
  platform?: string | null
  source?: string | null
  form?: string | null
  location?: string | null
  status?: string | null
  qualificationStatus?: string | null
  sourceRowNumber?: number
  customFields?: Record<string, unknown>
  raw: Record<string, unknown>
}

const aliases: Record<string, string[]> = {
  sourceId: ['lead id', 'lead_id', 'id', 'source id'], submittedAt: ['submitted at', 'submitted_at', 'created time', 'created_at', 'date'],
  name: ['name', 'full name', 'full_name'], phone: ['phone', 'phone number', 'mobile'], email: ['email', 'email address'],
  campaign: ['campaign', 'campaign name', 'campaign_name'], platform: ['platform'], source: ['source'], form: ['form', 'form name', 'form_name'],
  location: ['location', 'city', 'area'], status: ['lead status', 'status'], qualificationStatus: ['qualification status', 'qualification_status', 'qualified']
}

const keyOf = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ')

export function mapLeadRow(row: Record<string, unknown>, rowNumber?: number): NormalizedLead {
  const normalized = Object.fromEntries(Object.entries(row).map(([key, value]) => [keyOf(key), value]))
  const read = (field: string) => {
    const key = aliases[field]?.find(alias => normalized[keyOf(alias)] !== undefined)
    return key ? normalized[keyOf(key)] : undefined
  }
  const parsedDate = new Date(String(read('submittedAt') || ''))
  if (Number.isNaN(parsedDate.getTime())) throw new Error('Missing or invalid submission date.')
  const phone = String(read('phone') || '').trim()
  const email = String(read('email') || '').trim().toLowerCase()
  if (!phone && !email) throw new Error('A phone number or email address is required.')
  const usedKeys = new Set(Object.values(aliases).flat().map(keyOf))
  const customFields = Object.fromEntries(Object.entries(normalized).filter(([key]) => !usedKeys.has(key)))
  const statusInput = String(read('status') || 'New').trim()
  const status = allowedStatuses.has(statusInput) ? statusInput : 'New'
  const qualificationInput = String(read('qualificationStatus') || '').trim().toLowerCase()
  const qualificationStatus = qualificationInput === 'qualified' || qualificationInput === 'yes' || status === 'Qualified' || status === 'Converted'
    ? 'Qualified'
    : qualificationInput === 'not qualified' || qualificationInput === 'no' || status === 'Not Qualified' || status === 'Invalid' ? 'Not Qualified' : 'Pending'
  return {
    sourceId: read('sourceId') ? String(read('sourceId')).trim() : null, submittedAt: parsedDate,
    name: String(read('name') || '').trim(), phone, email, campaign: String(read('campaign') || '').trim(), platform: String(read('platform') || '').trim(),
    source: String(read('source') || '').trim(), form: String(read('form') || '').trim(), location: String(read('location') || '').trim(),
    status, qualificationStatus, sourceRowNumber: rowNumber, customFields, raw: row
  }
}

export async function upsertLeads(clientId: string, sourceType: string, input: NormalizedLead[], syncLogId?: string) {
  const db = useDatabase()
  const result = { checked: input.length, created: 0, updated: 0, duplicates: 0, invalid: 0, errors: [] as string[] }
  for (const lead of input) {
    try {
      const dedupeKey = buildDedupeKey(lead)
      const rowHash = buildRowHash(lead.raw)
      const predicate = lead.sourceId
        ? and(eq(leads.clientId, clientId), eq(leads.sourceType, sourceType), eq(leads.sourceId, lead.sourceId))
        : and(eq(leads.clientId, clientId), eq(leads.dedupeKey, dedupeKey))
      const existing = await db.select({ id: leads.id, sourceRowHash: leads.sourceRowHash }).from(leads).where(predicate).limit(1)
      const values = {
        clientId, sourceType, sourceId: lead.sourceId || null, dedupeKey, sourceRowHash: rowHash, sourceRowNumber: lead.sourceRowNumber,
        submittedAt: lead.submittedAt, name: lead.name, phone: lead.phone, email: lead.email, campaignName: lead.campaign,
        platform: lead.platform, source: lead.source, formName: lead.form, location: lead.location, status: lead.status || 'New',
        qualificationStatus: lead.qualificationStatus || 'Pending', customFields: lead.customFields, updatedAt: new Date()
      }
      const action = classifyRow(existing[0]?.sourceRowHash, rowHash)
      if (action === 'insert') {
        await db.insert(leads).values({ id: randomUUID(), ...values, createdAt: new Date() })
        result.created++
      } else if (action === 'duplicate') {
        result.duplicates++
        if (syncLogId) await db.insert(syncEvents).values({ id: randomUUID(), syncLogId, eventType: 'duplicate', sourceRowNumber: lead.sourceRowNumber, recordKey: lead.sourceId || dedupeKey, message: 'Record was unchanged and was not inserted again.' })
      } else {
        await db.update(leads).set(values).where(eq(leads.id, existing[0]!.id))
        result.updated++
      }
    } catch (error) {
      result.invalid++
      result.errors.push(error instanceof Error ? error.message : 'Unknown row error')
    }
  }
  return result
}
