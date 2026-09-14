import * as XLSX from 'xlsx'
import { parse } from 'csv-parse/sync'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const parts = await readMultipartFormData(event)
  const file = parts?.find(part => part.name === 'file')
  if (!file?.data || !file.filename) throw createError({ statusCode: 400, statusMessage: 'Choose a CSV or XLSX file.' })
  if (file.data.length > 10 * 1024 * 1024) throw createError({ statusCode: 413, statusMessage: 'The maximum upload size is 10 MB.' })
  const extension = file.filename.split('.').pop()?.toLowerCase()
  if (!['csv', 'xlsx'].includes(extension || '')) throw createError({ statusCode: 415, statusMessage: 'Only CSV and XLSX files are supported.' })
  let rows: Record<string, unknown>[]
  if (extension === 'csv') rows = parse(file.data, { columns: true, skip_empty_lines: true, bom: true, relax_column_count: true })
  else {
    const workbook = XLSX.read(file.data, { type: 'buffer', cellDates: true })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]!]
    if (!firstSheet) throw createError({ statusCode: 422, statusMessage: 'The workbook has no readable worksheet.' })
    rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' })
  }
  if (!rows.length) throw createError({ statusCode: 422, statusMessage: 'The uploaded file contains no data rows.' })
  return { fileName: file.filename.replace(/[^a-zA-Z0-9._ -]/g, ''), rowCount: rows.length, headers: Object.keys(rows[0]!), preview: rows.slice(0, 10), rows }
})
