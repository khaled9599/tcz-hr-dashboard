import { demoSyncLogs } from '../data/demo'
import { requireAuth } from '../utils/auth'
import { loadDataSources } from '../repositories/application'
import { isDemoMode } from '../utils/runtime'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const config = useRuntimeConfig(event)
  if (!isDemoMode(config)) return loadDataSources(user.clientId)
  return {
    leads: { type: 'Google Sheet', status: 'Connected', lastSyncAt: demoSyncLogs[0]!.endedAt, nextSyncAt: '2026-09-14T11:00:00Z', rowsSynced: 1284 },
    media: { type: 'Manual upload', status: 'Ready', lastImportAt: '2026-09-13T18:12:00Z', fileName: 'meta-performance-aug-sep.xlsx', rowsImported: 180 },
    syncHistory: demoSyncLogs
  }
})
