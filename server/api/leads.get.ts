import { demoLeads } from '../data/demo'
import { requireAuth } from '../utils/auth'
import { loadLeads } from '../repositories/application'
import { isDemoMode } from '../utils/runtime'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const config = useRuntimeConfig(event)
  const query = getQuery(event)
  if (!isDemoMode(config)) return loadLeads(user.clientId, query)
  const page = Math.max(1, Number(query.page || 1))
  const pageSize = Math.min(100, Math.max(10, Number(query.pageSize || 25)))
  const search = String(query.search || '').toLowerCase()
  const campaign = String(query.campaign || '')
  const status = String(query.status || '')
  const qualification = String(query.qualification || '')
  const filtered = demoLeads().filter((row) => {
    const haystack = `${row.name} ${row.phone} ${row.email} ${row.id}`.toLowerCase()
    return (!search || haystack.includes(search)) && (!campaign || row.campaignId === campaign) && (!status || row.status === status) && (!qualification || row.qualificationStatus === qualification)
  })
  const start = (page - 1) * pageSize
  return { rows: filtered.slice(start, start + pageSize), total: filtered.length, page, pageSize, customFields: ['preferredUnit', 'language'] }
})
