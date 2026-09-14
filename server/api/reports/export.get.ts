import * as XLSX from 'xlsx'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { demoCampaigns, demoLeads } from '../../data/demo'
import { calculateMetrics, sumTotals } from '../../domain/analytics'
import { requireAuth } from '../../utils/auth'
import { loadCampaigns, loadLeadExportRows, resolveDateRange } from '../../repositories/application'
import { isDemoMode } from '../../utils/runtime'

const csvCell = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const config = useRuntimeConfig(event)
  const query = getQuery(event)
  const format = String(query.format || 'pdf')
  const dataset = String(query.dataset || 'summary')
  const range = resolveDateRange(query)
  const demo = isDemoMode(config)
  const campaigns = demo ? demoCampaigns.map(row => ({ ...row, ...calculateMetrics(row) })) : await loadCampaigns(user.clientId, range, { platform: String(query.platform || '') })
  const rows = dataset === 'leads' ? (demo ? demoLeads().map(row => ({ ID: row.id, Submitted: row.submittedAt, Name: row.name, Phone: row.phone, Email: row.email, Campaign: row.campaign, Platform: row.platform, Status: row.status, Qualification: row.qualificationStatus })) : await loadLeadExportRows(user.clientId, range)) : campaigns.map(row => ({ Campaign: row.name, Status: row.status, Platform: row.platform, Spend: row.spend, Reach: row.reach, Impressions: row.impressions, Clicks: row.clicks, Leads: row.leads, CPL: row.cpl, Qualified: row.qualifiedLeads, CPQL: row.cpql, ConversionRate: row.conversionRate }))
  const baseName = `kog-${dataset}-${new Date().toISOString().slice(0, 10)}`

  if (format === 'csv') {
    const headers = Object.keys(rows[0] || {})
    const body = [headers.map(csvCell).join(','), ...rows.map(row => headers.map(header => csvCell((row as any)[header])).join(','))].join('\n')
    setResponseHeaders(event, { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="${baseName}.csv"` })
    return `\ufeff${body}`
  }
  if (format === 'xlsx') {
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), dataset === 'leads' ? 'Leads' : 'Campaigns')
    const output = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    setResponseHeaders(event, { 'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'content-disposition': `attachment; filename="${baseName}.xlsx"` })
    return output
  }

  const totals = calculateMetrics(sumTotals(campaigns))
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([595, 842])
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  page.drawRectangle({ x: 0, y: 730, width: 595, height: 112, color: rgb(0.04, 0.04, 0.04) })
  page.drawText('KOG Performance Report', { x: 42, y: 790, size: 24, font: bold, color: rgb(1, 1, 1) })
  page.drawText('Powered by The Creative Zone', { x: 42, y: 764, size: 10, font, color: rgb(0.75, 0.75, 0.75) })
  const metrics = [{ label: 'Leads Submitted', value: totals.leads.toLocaleString() }, { label: 'Total Spend', value: `EGP ${Math.round(totals.spend).toLocaleString()}` }, { label: 'Cost Per Lead', value: `EGP ${Math.round(totals.cpl).toLocaleString()}` }, { label: 'Qualified Leads', value: totals.qualifiedLeads.toLocaleString() }, { label: 'Cost Per Qualified Lead', value: `EGP ${Math.round(totals.cpql).toLocaleString()}` }]
  metrics.forEach(({ label, value }, index) => { const column = index % 2; const row = Math.floor(index / 2); const x = 42 + column * 260; const y = 680 - row * 82; page.drawText(label, { x, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) }); page.drawText(value, { x, y: y - 28, size: 20, font: bold, color: rgb(0.06, 0.06, 0.06) }) })
  page.drawText('Campaign comparison', { x: 42, y: 420, size: 15, font: bold })
  let y = 390
  campaigns.slice(0, 10).forEach((campaign) => { page.drawText(campaign.name.slice(0, 34), { x: 42, y, size: 9, font }); page.drawText(`${campaign.leads} leads`, { x: 320, y, size: 9, font: bold }); page.drawText(`${Math.round(campaign.qualificationRate)}% qualified`, { x: 410, y, size: 9, font }); y -= 28 })
  page.drawText(`Generated ${new Date().toLocaleString('en-EG')}`, { x: 42, y: 48, size: 8, font, color: rgb(0.5, 0.5, 0.5) })
  setResponseHeaders(event, { 'content-type': 'application/pdf', 'content-disposition': `attachment; filename="${baseName}.pdf"` })
  return Buffer.from(await pdf.save())
})
