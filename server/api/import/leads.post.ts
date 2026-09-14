import { z } from 'zod'
import { mapLeadRow, upsertLeads } from '../../services/leads'
import { requireAuth } from '../../utils/auth'
import { isDemoMode } from '../../utils/runtime'

const bodySchema = z.object({ fileName: z.string().min(1).max(255), rows: z.array(z.record(z.string(), z.unknown())).max(10000) })

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const config = useRuntimeConfig(event)
  const input = bodySchema.parse(await readBody(event))
  const valid = []
  const errors: string[] = []
  for (let index = 0; index < input.rows.length; index++) {
    try { valid.push(mapLeadRow(input.rows[index]!, index + 2)) } catch (error) { errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Invalid row'}`) }
  }
  if (isDemoMode(config)) return { imported: valid.length, updated: 0, duplicates: 0, invalid: errors.length, skipped: 0, errors: errors.slice(0, 50) }
  const result = await upsertLeads(user.clientId, input.fileName.endsWith('.xlsx') ? 'xlsx' : 'csv', valid)
  return { imported: result.created, updated: result.updated, duplicates: result.duplicates, invalid: result.invalid + errors.length, skipped: 0, errors: [...errors, ...result.errors].slice(0, 50) }
})
