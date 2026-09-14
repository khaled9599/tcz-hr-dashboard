import { google } from 'googleapis'
import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { syncJobs, syncLogs } from '../db/schema'
import { useDatabase, usePool } from '../db'
import { mapLeadRow, upsertLeads } from './leads'

export async function synchronizeGoogleSheet(clientId: string) {
  const config = useRuntimeConfig()
  if (!config.googleServiceAccountEmail || !config.googlePrivateKey || !config.googleSheetId) throw new Error('Google Sheets credentials or sheet ID are not configured.')
  const pool = usePool()
  const lockKey = `google-sheet:${clientId}`
  const [lockRows] = await pool.query<any[]>('SELECT GET_LOCK(?, 0) AS acquired', [lockKey])
  if (!lockRows[0]?.acquired) throw createError({ statusCode: 409, statusMessage: 'A lead synchronization is already running.' })

  const db = useDatabase()
  const jobId = randomUUID()
  const logId = randomUUID()
  const startedAt = new Date()
  try {
    await db.insert(syncJobs).values({ id: jobId, clientId, sourceType: 'google_sheet', status: 'Running', lockKey, lockedUntil: new Date(Date.now() + 25 * 60 * 1000), startedAt, createdAt: startedAt, updatedAt: startedAt })
    await db.insert(syncLogs).values({ id: logId, clientId, syncJobId: jobId, sourceType: 'google_sheet', status: 'Running', startedAt })
    const auth = new google.auth.JWT({ email: String(config.googleServiceAccountEmail), key: String(config.googlePrivateKey).replace(/\\n/g, '\n'), scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] })
    const sheets = google.sheets({ version: 'v4', auth })
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: String(config.googleSheetId), range: String(config.googleSheetRange) })
    const values = response.data.values || []
    if (values.length < 2) throw new Error('The configured sheet has no lead rows.')
    const headers = values[0]!.map(String)
    const valid = []
    const mappingErrors: string[] = []
    for (let index = 1; index < values.length; index++) {
      const sheetRow = values[index]!
      const row = Object.fromEntries(headers.map((header, column) => [header, sheetRow[column] ?? '']))
      try { valid.push(mapLeadRow(row, index + 1)) } catch (error) { mappingErrors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Invalid row'}`) }
    }
    const result = await upsertLeads(clientId, 'google_sheet', valid, logId)
    const failed = mappingErrors.length + result.invalid
    const status = failed ? 'Partial' : 'Success'
    const endedAt = new Date()
    await db.update(syncLogs).set({ status, endedAt, rowsChecked: values.length - 1, createdRecords: result.created, updatedRecords: result.updated, duplicateRecords: result.duplicates, failedRecords: failed, errorMessage: [...mappingErrors, ...result.errors].slice(0, 20).join('\n') || null }).where(eq(syncLogs.id, logId))
    await db.update(syncJobs).set({ status, endedAt, lastSuccessfulAt: endedAt, lockedUntil: null }).where(eq(syncJobs.id, jobId))
    return { ...result, invalid: failed, status, lastSuccessfulAt: endedAt }
  } catch (error) {
    const endedAt = new Date()
    const message = error instanceof Error ? error.message.slice(0, 2000) : 'Google Sheet synchronization failed.'
    await db.update(syncLogs).set({ status: 'Failed', endedAt, errorMessage: message }).where(eq(syncLogs.id, logId))
    await db.update(syncJobs).set({ status: 'Failed', endedAt, lockedUntil: null }).where(eq(syncJobs.id, jobId))
    throw error
  } finally {
    await pool.query('SELECT RELEASE_LOCK(?)', [lockKey])
  }
}
