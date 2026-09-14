import { calculateMetrics, percentChange, sumTotals } from '../domain/analytics'
import { usePool } from '../db'

export function resolveDateRange(query: Record<string, unknown>) {
  const end = /^\d{4}-\d{2}-\d{2}$/.test(String(query.end || '')) ? String(query.end) : new Date().toISOString().slice(0, 10)
  const fallbackStart = new Date(`${end}T00:00:00Z`); fallbackStart.setUTCDate(fallbackStart.getUTCDate() - 29)
  const start = /^\d{4}-\d{2}-\d{2}$/.test(String(query.start || '')) ? String(query.start) : fallbackStart.toISOString().slice(0, 10)
  if (start > end) throw createError({ statusCode: 400, statusMessage: 'The start date must be before the end date.' })
  return { start, end }
}

function previousRange(start: string, end: string) {
  const startDate = new Date(`${start}T00:00:00Z`)
  const endDate = new Date(`${end}T00:00:00Z`)
  const days = Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1
  const previousEnd = new Date(startDate); previousEnd.setUTCDate(previousEnd.getUTCDate() - 1)
  const previousStart = new Date(previousEnd); previousStart.setUTCDate(previousStart.getUTCDate() - days + 1)
  return { start: previousStart.toISOString().slice(0, 10), end: previousEnd.toISOString().slice(0, 10) }
}

export async function loadCampaigns(clientId: string, range: { start: string, end: string }, filters: { search?: string, platform?: string, status?: string } = {}) {
  const pool = usePool()
  const conditions = ['c.client_id = ?']
  const tailParams: Array<string | number> = [clientId]
  if (filters.search) { conditions.push('c.name LIKE ?'); tailParams.push(`%${filters.search.replaceAll('%', '\\%').replaceAll('_', '\\_')}%`) }
  if (filters.platform) { conditions.push('c.platform = ?'); tailParams.push(filters.platform) }
  if (filters.status) { conditions.push('c.status = ?'); tailParams.push(filters.status) }
  const [rows] = await pool.execute<any[]>(`
    SELECT c.id, c.name, c.status, c.platform, c.objective,
      DATE_FORMAT(c.start_date, '%Y-%m-%d') startDate, DATE_FORMAT(c.end_date, '%Y-%m-%d') endDate,
      COALESCE(p.spend, 0) spend, COALESCE(p.reach, 0) reach, COALESCE(p.impressions, 0) impressions,
      COALESCE(p.clicks, 0) clicks, COALESCE(p.linkClicks, 0) linkClicks,
      COALESCE(l.leads, 0) leads, COALESCE(l.qualifiedLeads, 0) qualifiedLeads, COALESCE(l.conversions, 0) conversions
    FROM campaigns c
    LEFT JOIN (
      SELECT campaign_id, SUM(spend) spend, SUM(reach) reach, SUM(impressions) impressions, SUM(clicks) clicks, SUM(link_clicks) linkClicks
      FROM performance_records WHERE client_id = ? AND record_date >= ? AND record_date < DATE_ADD(?, INTERVAL 1 DAY) GROUP BY campaign_id
    ) p ON p.campaign_id = c.id
    LEFT JOIN (
      SELECT campaign_id, COUNT(*) leads,
        SUM(qualification_status = 'Qualified') qualifiedLeads, SUM(status = 'Converted') conversions
      FROM leads WHERE client_id = ? AND submitted_at >= ? AND submitted_at < DATE_ADD(?, INTERVAL 1 DAY) GROUP BY campaign_id
    ) l ON l.campaign_id = c.id
    WHERE ${conditions.join(' AND ')} ORDER BY leads DESC, spend DESC LIMIT 500`,
  [clientId, range.start, range.end, clientId, range.start, range.end, ...tailParams])
  return rows.map(row => calculateMetrics({ ...row, spend: Number(row.spend), reach: Number(row.reach), impressions: Number(row.impressions), clicks: Number(row.clicks), linkClicks: Number(row.linkClicks), leads: Number(row.leads), qualifiedLeads: Number(row.qualifiedLeads), conversions: Number(row.conversions) }))
}

export async function loadDashboard(clientId: string, range: { start: string, end: string }) {
  const prior = previousRange(range.start, range.end)
  const [campaigns, previousCampaigns, trend] = await Promise.all([loadCampaigns(clientId, range), loadCampaigns(clientId, prior), loadTrend(clientId, range)])
  const current = calculateMetrics(sumTotals(campaigns))
  const previous = calculateMetrics(sumTotals(previousCampaigns))
  const metric = (key: string, label: string, value: number, previousValue: number, format: string, primary = false, invertTrend = false) => ({ key, label, value, previous: previousValue, change: percentChange(value, previousValue), format, primary, invertTrend })
  const [syncRows] = await usePool().execute<any[]>('SELECT ended_at FROM sync_logs WHERE client_id = ? AND status IN (\'Success\', \'Partial\') ORDER BY ended_at DESC LIMIT 1', [clientId])
  return { scope: range, lastSyncAt: syncRows[0]?.ended_at || null, metrics: [metric('leads', 'Leads Submitted', current.leads, previous.leads, 'number', true), metric('spend', 'Total Spend', current.spend, previous.spend, 'currency'), metric('cpl', 'Cost Per Lead', current.cpl, previous.cpl, 'currency', false, true), metric('qualifiedLeads', 'Qualified Leads', current.qualifiedLeads, previous.qualifiedLeads, 'number'), metric('cpql', 'Cost Per Qualified Lead', current.cpql, previous.cpql, 'currency', false, true), metric('conversionRate', 'Conversion Rate', current.conversionRate, previous.conversionRate, 'percent')], secondaryMetrics: [metric('impressions', 'Impressions', current.impressions, previous.impressions, 'number'), metric('reach', 'Reach', current.reach, previous.reach, 'number'), metric('clicks', 'Clicks', current.clicks, previous.clicks, 'number'), metric('ctr', 'CTR', current.ctr, previous.ctr, 'percent'), metric('cpc', 'CPC', current.cpc, previous.cpc, 'currency', false, true), metric('cpm', 'CPM', current.cpm, previous.cpm, 'currency', false, true), metric('frequency', 'Frequency', current.frequency, previous.frequency, 'decimal')], trend, campaigns }
}

async function loadTrend(clientId: string, range: { start: string, end: string }) {
  const pool = usePool()
  const [media] = await pool.execute<any[]>('SELECT DATE_FORMAT(record_date, \'%Y-%m-%d\') date, SUM(spend) spend, SUM(impressions) impressions, SUM(clicks) clicks FROM performance_records WHERE client_id = ? AND record_date >= ? AND record_date < DATE_ADD(?, INTERVAL 1 DAY) GROUP BY DATE(record_date) ORDER BY date', [clientId, range.start, range.end])
  const [leadRows] = await pool.execute<any[]>('SELECT DATE_FORMAT(submitted_at, \'%Y-%m-%d\') date, COUNT(*) leads, SUM(qualification_status = \'Qualified\') qualifiedLeads FROM leads WHERE client_id = ? AND submitted_at >= ? AND submitted_at < DATE_ADD(?, INTERVAL 1 DAY) GROUP BY DATE(submitted_at) ORDER BY date', [clientId, range.start, range.end])
  const dates = new Set([...media.map(row => row.date), ...leadRows.map(row => row.date)])
  return [...dates].sort().map((date) => { const m = media.find(row => row.date === date) || {}; const l = leadRows.find(row => row.date === date) || {}; const spend = Number(m.spend || 0), leads = Number(l.leads || 0), qualifiedLeads = Number(l.qualifiedLeads || 0), clicks = Number(m.clicks || 0), impressions = Number(m.impressions || 0); return { date, spend, leads, cpl: leads ? spend / leads : 0, qualifiedLeads, cpql: qualifiedLeads ? spend / qualifiedLeads : 0, clicks, ctr: impressions ? clicks / impressions * 100 : 0, cpc: clicks ? spend / clicks : 0, cpm: impressions ? spend / impressions * 1000 : 0 } })
}

export async function loadLeads(clientId: string, input: Record<string, unknown>) {
  const pool = usePool()
  const page = Math.max(1, Number(input.page || 1)), pageSize = Math.min(100, Math.max(10, Number(input.pageSize || 25)))
  const conditions = ['l.client_id = ?']; const params: Array<string | number> = [clientId]
  if (input.search) { conditions.push('(l.name LIKE ? OR l.phone LIKE ? OR l.email LIKE ? OR l.id LIKE ?)'); const term = `%${String(input.search).replaceAll('%', '\\%').replaceAll('_', '\\_')}%`; params.push(term, term, term, term) }
  if (input.campaign) { conditions.push('l.campaign_id = ?'); params.push(String(input.campaign)) }
  if (input.status) { conditions.push('l.status = ?'); params.push(String(input.status)) }
  if (input.qualification) { conditions.push('l.qualification_status = ?'); params.push(String(input.qualification)) }
  const where = conditions.join(' AND ')
  const [countRows] = await pool.execute<any[]>(`SELECT COUNT(*) total FROM leads l WHERE ${where}`, params)
  const [rows] = await pool.execute<any[]>(`SELECT l.id, l.submitted_at submittedAt, l.name, l.phone, l.email, l.campaign_id campaignId, COALESCE(c.name,l.campaign_name,'Unmatched') campaign, l.platform, l.source, l.form_name form, l.location, l.status, l.qualification_status qualificationStatus, l.custom_fields customFields FROM leads l LEFT JOIN campaigns c ON c.id = l.campaign_id AND c.client_id = l.client_id WHERE ${where} ORDER BY l.submitted_at DESC LIMIT ? OFFSET ?`, [...params, pageSize, (page - 1) * pageSize])
  const normalizedRows = rows.map(row => ({
    ...row,
    customFields: typeof row.customFields === 'string' ? JSON.parse(row.customFields) : (row.customFields || {})
  }))
  const customFields = [...new Set(normalizedRows.flatMap(row => Object.keys(row.customFields)))]
  return { rows: normalizedRows, total: Number(countRows[0]?.total || 0), page, pageSize, customFields }
}

export async function loadDataSources(clientId: string) {
  const pool = usePool()
  const [logs] = await pool.execute<any[]>('SELECT id, started_at startedAt, ended_at endedAt, source_type source, rows_checked rowsChecked, created_records created, updated_records updated, duplicate_records duplicates, failed_records failed, status, error_message errorMessage FROM sync_logs WHERE client_id = ? ORDER BY started_at DESC LIMIT 50', [clientId])
  const [imports] = await pool.execute<any[]>('SELECT file_name fileName, created_at createdAt, created_records rowsImported FROM imports WHERE client_id = ? AND kind = \'media\' ORDER BY created_at DESC LIMIT 1', [clientId])
  const last = logs.find(row => row.status === 'Success' || row.status === 'Partial')
  const [countRows] = await pool.execute<any[]>('SELECT COUNT(*) total FROM leads WHERE client_id = ?', [clientId])
  return { leads: { type: 'Google Sheet', status: last ? 'Connected' : 'Not connected', lastSyncAt: last?.endedAt || null, nextSyncAt: last?.endedAt ? new Date(new Date(last.endedAt).getTime() + 30 * 60000) : null, rowsSynced: Number(countRows[0]?.total || 0) }, media: { type: 'Manual upload', status: 'Ready', lastImportAt: imports[0]?.createdAt || null, fileName: imports[0]?.fileName || null, rowsImported: Number(imports[0]?.rowsImported || 0) }, syncHistory: logs }
}

export async function loadCampaignDetail(clientId: string, campaignId: string, range: { start: string, end: string }) {
  const campaign = (await loadCampaigns(clientId, range)).find(row => row.id === campaignId)
  if (!campaign) return null
  const pool = usePool()
  const [media] = await pool.execute<any[]>('SELECT DATE_FORMAT(record_date, \'%Y-%m-%d\') date, SUM(spend) spend, SUM(impressions) impressions, SUM(clicks) clicks FROM performance_records WHERE client_id = ? AND campaign_id = ? AND record_date >= ? AND record_date < DATE_ADD(?, INTERVAL 1 DAY) GROUP BY DATE(record_date) ORDER BY date', [clientId, campaignId, range.start, range.end])
  const [leadRows] = await pool.execute<any[]>('SELECT DATE_FORMAT(submitted_at, \'%Y-%m-%d\') date, COUNT(*) leads, SUM(qualification_status = \'Qualified\') qualifiedLeads FROM leads WHERE client_id = ? AND campaign_id = ? AND submitted_at >= ? AND submitted_at < DATE_ADD(?, INTERVAL 1 DAY) GROUP BY DATE(submitted_at) ORDER BY date', [clientId, campaignId, range.start, range.end])
  const dates = new Set([...media.map(row => row.date), ...leadRows.map(row => row.date)])
  const trend = [...dates].sort().map((date) => { const m = media.find(row => row.date === date) || {}; const l = leadRows.find(row => row.date === date) || {}; const spend = Number(m.spend || 0), leads = Number(l.leads || 0), qualifiedLeads = Number(l.qualifiedLeads || 0), clicks = Number(m.clicks || 0), impressions = Number(m.impressions || 0); return { date, spend, leads, cpl: leads ? spend / leads : 0, qualifiedLeads, cpql: qualifiedLeads ? spend / qualifiedLeads : 0, clicks, ctr: impressions ? clicks / impressions * 100 : 0, cpc: clicks ? spend / clicks : 0, cpm: impressions ? spend / impressions * 1000 : 0 } })
  return { campaign, trend, adSets: [] }
}

export async function loadLeadAnalysis(clientId: string, range: { start: string, end: string }) {
  const pool = usePool()
  const dateWhere = 'client_id = ? AND submitted_at >= ? AND submitted_at < DATE_ADD(?, INTERVAL 1 DAY)'
  const params = [clientId, range.start, range.end]
  const [summaryRows, platformRows, locationRows, statusRows, qualificationRows, hourRows, campaigns] = await Promise.all([
    pool.execute<any[]>(`SELECT COUNT(*) total, SUM(status NOT IN ('Invalid','Duplicate')) valid, SUM(status = 'Invalid') invalid, SUM(status = 'Duplicate') duplicates, SUM(qualification_status = 'Qualified') qualified, SUM(status = 'Converted') converted FROM leads WHERE ${dateWhere}`, params),
    pool.execute<any[]>(`SELECT COALESCE(platform,'Unknown') name, COUNT(*) value FROM leads WHERE ${dateWhere} GROUP BY platform ORDER BY value DESC`, params),
    pool.execute<any[]>(`SELECT COALESCE(location,'Unknown') name, COUNT(*) value FROM leads WHERE ${dateWhere} GROUP BY location ORDER BY value DESC`, params),
    pool.execute<any[]>(`SELECT status name, COUNT(*) value FROM leads WHERE ${dateWhere} GROUP BY status ORDER BY value DESC`, params),
    pool.execute<any[]>(`SELECT qualification_status name, COUNT(*) value FROM leads WHERE ${dateWhere} GROUP BY qualification_status ORDER BY value DESC`, params),
    pool.execute<any[]>(`SELECT HOUR(submitted_at) hour, COUNT(*) value FROM leads WHERE ${dateWhere} GROUP BY HOUR(submitted_at) ORDER BY hour`, params),
    loadCampaigns(clientId, range)
  ])
  const summary = (summaryRows[0] as any[])[0] || {}
  const total = Number(summary.total || 0), valid = Number(summary.valid || 0), qualified = Number(summary.qualified || 0), converted = Number(summary.converted || 0)
  const spend = campaigns.reduce((sum, row) => sum + row.spend, 0)
  return { metrics: { total, valid, invalid: Number(summary.invalid || 0), duplicates: Number(summary.duplicates || 0), qualified, converted, qualificationRate: valid ? qualified / valid * 100 : 0, conversionRate: valid ? converted / valid * 100 : 0, cpql: qualified ? spend / qualified : 0 }, byCampaign: campaigns.map(row => ({ name: row.name, leads: row.leads, qualifiedLeads: row.qualifiedLeads, qualificationRate: row.qualificationRate, spend: row.spend })), byPlatform: platformRows[0], byLocation: locationRows[0], byStatus: statusRows[0], byQualification: qualificationRows[0], byHour: hourRows[0] }
}

export async function loadLeadExportRows(clientId: string, range: { start: string, end: string }) {
  const [rows] = await usePool().execute<any[]>('SELECT l.id ID, l.submitted_at Submitted, l.name Name, l.phone Phone, l.email Email, COALESCE(c.name,l.campaign_name,\'Unmatched\') Campaign, l.platform Platform, l.source Source, l.form_name Form, l.location Location, l.status Status, l.qualification_status Qualification FROM leads l LEFT JOIN campaigns c ON c.id = l.campaign_id AND c.client_id = l.client_id WHERE l.client_id = ? AND l.submitted_at >= ? AND l.submitted_at < DATE_ADD(?, INTERVAL 1 DAY) ORDER BY l.submitted_at DESC LIMIT 50000', [clientId, range.start, range.end])
  return rows
}
