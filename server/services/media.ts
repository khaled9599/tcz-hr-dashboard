import { createHash, randomUUID } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { campaigns, performanceRecords } from '../db/schema'
import { useDatabase } from '../db'
import { normalizeCampaignName } from '../domain/analytics'

const aliases: Record<string, string[]> = {
  date: ['date', 'day', 'reporting starts', 'reporting_start'], campaignId: ['campaign id', 'campaign_id'], campaign: ['campaign name', 'campaign_name', 'campaign'],
  platform: ['platform', 'publisher platform'], objective: ['objective', 'campaign objective'], status: ['status', 'delivery'], spend: ['spend', 'amount spent', 'cost'],
  reach: ['reach'], impressions: ['impressions'], clicks: ['clicks', 'all clicks'], linkClicks: ['link clicks', 'link_clicks'], leads: ['leads', 'results']
}
const keyOf = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ')
const numeric = (value: unknown) => { const parsed = Number(String(value ?? '0').replace(/[^0-9.-]/g, '')); return Number.isFinite(parsed) ? parsed : 0 }

export function mapMediaRow(row: Record<string, unknown>) {
  const normalized = Object.fromEntries(Object.entries(row).map(([key, value]) => [keyOf(key), value]))
  const read = (field: string) => { const key = aliases[field]?.find(alias => normalized[keyOf(alias)] !== undefined); return key ? normalized[keyOf(key)] : undefined }
  const date = new Date(String(read('date') || ''))
  const campaign = String(read('campaign') || '').trim()
  if (Number.isNaN(date.getTime())) throw new Error('Missing or invalid reporting date.')
  if (!campaign) throw new Error('Campaign name is required.')
  return { date, campaignId: String(read('campaignId') || '').trim() || null, campaign, platform: String(read('platform') || 'Unknown').trim(), objective: String(read('objective') || '').trim(), status: String(read('status') || 'Active').trim(), spend: numeric(read('spend')), reach: Math.round(numeric(read('reach'))), impressions: Math.round(numeric(read('impressions'))), clicks: Math.round(numeric(read('clicks'))), linkClicks: Math.round(numeric(read('linkClicks'))), leads: Math.round(numeric(read('leads'))), raw: row }
}

export async function upsertMediaRows(clientId: string, sourceType: string, rows: ReturnType<typeof mapMediaRow>[]) {
  const db = useDatabase()
  const result = { checked: rows.length, imported: 0, updated: 0, invalid: 0, errors: [] as string[] }
  for (const row of rows) {
    try {
      const normalizedName = normalizeCampaignName(row.campaign)
      const existingCampaign = await db.select({ id: campaigns.id }).from(campaigns).where(row.campaignId ? and(eq(campaigns.clientId, clientId), eq(campaigns.sourceType, sourceType), eq(campaigns.sourceCampaignId, row.campaignId)) : and(eq(campaigns.clientId, clientId), eq(campaigns.normalizedName, normalizedName))).limit(1)
      const campaignId = existingCampaign[0]?.id || randomUUID()
      if (!existingCampaign[0]) await db.insert(campaigns).values({ id: campaignId, clientId, sourceType, sourceCampaignId: row.campaignId, normalizedName, name: row.campaign, platform: row.platform, objective: row.objective, status: row.status, createdAt: new Date(), updatedAt: new Date() })
      const sourceRecordId = createHash('sha256').update(`${row.campaignId || normalizedName}|${row.date.toISOString().slice(0, 10)}|${row.platform}`).digest('hex')
      const existing = await db.select({ id: performanceRecords.id }).from(performanceRecords).where(and(eq(performanceRecords.clientId, clientId), eq(performanceRecords.sourceType, sourceType), eq(performanceRecords.sourceRecordId, sourceRecordId))).limit(1)
      const values = { clientId, campaignId, sourceType, sourceRecordId, recordDate: row.date, spend: String(row.spend), reach: row.reach, impressions: row.impressions, clicks: row.clicks, linkClicks: row.linkClicks, platformLeads: row.leads, rawMetadata: row.raw, updatedAt: new Date() }
      if (existing[0]) { await db.update(performanceRecords).set(values).where(eq(performanceRecords.id, existing[0].id)); result.updated++ } else { await db.insert(performanceRecords).values({ id: randomUUID(), ...values, createdAt: new Date() }); result.imported++ }
    } catch (error) { result.invalid++; result.errors.push(error instanceof Error ? error.message : 'Unknown media row error') }
  }
  return result
}
