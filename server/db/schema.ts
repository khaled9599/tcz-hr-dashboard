import { mysqlTable, varchar, datetime, int, decimal, json, index, uniqueIndex, text } from 'drizzle-orm/mysql-core'

const timestamps = {
  createdAt: datetime('created_at', { mode: 'date' }).notNull().default(new Date()),
  updatedAt: datetime('updated_at', { mode: 'date' }).notNull().default(new Date()).$onUpdate(() => new Date())
}

export const clients = mysqlTable('clients', {
  id: varchar('id', { length: 36 }).primaryKey(),
  slug: varchar('slug', { length: 64 }).notNull(),
  name: varchar('name', { length: 160 }).notNull(),
  timezone: varchar('timezone', { length: 64 }).notNull().default('Africa/Cairo'),
  currency: varchar('currency', { length: 3 }).notNull().default('EGP'),
  ...timestamps
}, table => [uniqueIndex('clients_slug_uq').on(table.slug)])

export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 160 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 32 }).notNull().default('client_viewer'),
  disabledAt: datetime('disabled_at', { mode: 'date' }),
  ...timestamps
}, table => [uniqueIndex('users_email_uq').on(table.email)])

export const userClients = mysqlTable('user_clients', {
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  clientId: varchar('client_id', { length: 36 }).notNull().references(() => clients.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 32 }).notNull().default('viewer')
}, table => [uniqueIndex('user_clients_uq').on(table.userId, table.clientId)])

export const sessions = mysqlTable('sessions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 64 }).notNull(),
  expiresAt: datetime('expires_at', { mode: 'date' }).notNull(),
  lastSeenAt: datetime('last_seen_at', { mode: 'date' }).notNull(),
  userAgent: varchar('user_agent', { length: 500 }),
  ipHash: varchar('ip_hash', { length: 64 }),
  createdAt: datetime('created_at', { mode: 'date' }).notNull().default(new Date())
}, table => [uniqueIndex('sessions_token_uq').on(table.tokenHash), index('sessions_user_idx').on(table.userId)])

export const campaigns = mysqlTable('campaigns', {
  id: varchar('id', { length: 36 }).primaryKey(),
  clientId: varchar('client_id', { length: 36 }).notNull().references(() => clients.id, { onDelete: 'cascade' }),
  sourceType: varchar('source_type', { length: 32 }).notNull(),
  sourceCampaignId: varchar('source_campaign_id', { length: 160 }),
  normalizedName: varchar('normalized_name', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  platform: varchar('platform', { length: 40 }).notNull(),
  objective: varchar('objective', { length: 80 }),
  status: varchar('status', { length: 32 }).notNull().default('Active'),
  startDate: datetime('start_date', { mode: 'date' }),
  endDate: datetime('end_date', { mode: 'date' }),
  ...timestamps
}, table => [
  uniqueIndex('campaign_source_uq').on(table.clientId, table.sourceType, table.sourceCampaignId),
  index('campaign_client_status_idx').on(table.clientId, table.status),
  index('campaign_normalized_name_idx').on(table.clientId, table.normalizedName)
])

export const performanceRecords = mysqlTable('performance_records', {
  id: varchar('id', { length: 36 }).primaryKey(),
  clientId: varchar('client_id', { length: 36 }).notNull().references(() => clients.id, { onDelete: 'cascade' }),
  campaignId: varchar('campaign_id', { length: 36 }).references(() => campaigns.id, { onDelete: 'set null' }),
  sourceType: varchar('source_type', { length: 32 }).notNull(),
  sourceRecordId: varchar('source_record_id', { length: 190 }),
  recordDate: datetime('record_date', { mode: 'date' }).notNull(),
  spend: decimal('spend', { precision: 16, scale: 4 }).notNull().default('0'),
  reach: int('reach').notNull().default(0),
  impressions: int('impressions').notNull().default(0),
  clicks: int('clicks').notNull().default(0),
  linkClicks: int('link_clicks').notNull().default(0),
  platformLeads: int('platform_leads').notNull().default(0),
  rawMetadata: json('raw_metadata'),
  ...timestamps
}, table => [
  uniqueIndex('performance_source_uq').on(table.clientId, table.sourceType, table.sourceRecordId),
  index('performance_client_date_idx').on(table.clientId, table.recordDate),
  index('performance_campaign_date_idx').on(table.campaignId, table.recordDate)
])

export const leads = mysqlTable('leads', {
  id: varchar('id', { length: 36 }).primaryKey(),
  clientId: varchar('client_id', { length: 36 }).notNull().references(() => clients.id, { onDelete: 'cascade' }),
  campaignId: varchar('campaign_id', { length: 36 }).references(() => campaigns.id, { onDelete: 'set null' }),
  sourceType: varchar('source_type', { length: 32 }).notNull(),
  sourceId: varchar('source_id', { length: 190 }),
  dedupeKey: varchar('dedupe_key', { length: 64 }).notNull(),
  sourceRowHash: varchar('source_row_hash', { length: 64 }).notNull(),
  sourceRowNumber: int('source_row_number'),
  submittedAt: datetime('submitted_at', { mode: 'date' }).notNull(),
  name: varchar('name', { length: 255 }),
  phone: varchar('phone', { length: 80 }),
  email: varchar('email', { length: 255 }),
  campaignName: varchar('campaign_name', { length: 255 }),
  platform: varchar('platform', { length: 40 }),
  source: varchar('source', { length: 120 }),
  formName: varchar('form_name', { length: 255 }),
  location: varchar('location', { length: 160 }),
  status: varchar('status', { length: 32 }).notNull().default('New'),
  qualificationStatus: varchar('qualification_status', { length: 32 }).notNull().default('Pending'),
  customFields: json('custom_fields'),
  ...timestamps
}, table => [
  uniqueIndex('leads_source_uq').on(table.clientId, table.sourceType, table.sourceId),
  index('leads_dedupe_idx').on(table.clientId, table.dedupeKey),
  index('leads_client_date_idx').on(table.clientId, table.submittedAt),
  index('leads_campaign_idx').on(table.clientId, table.campaignId),
  index('leads_status_idx').on(table.clientId, table.status, table.qualificationStatus)
])

export const imports = mysqlTable('imports', {
  id: varchar('id', { length: 36 }).primaryKey(),
  clientId: varchar('client_id', { length: 36 }).notNull().references(() => clients.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 36 }).references(() => users.id, { onDelete: 'set null' }),
  kind: varchar('kind', { length: 32 }).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  sourceType: varchar('source_type', { length: 32 }).notNull(),
  status: varchar('status', { length: 32 }).notNull(),
  rowsChecked: int('rows_checked').notNull().default(0),
  createdRecords: int('created_records').notNull().default(0),
  updatedRecords: int('updated_records').notNull().default(0),
  duplicateRecords: int('duplicate_records').notNull().default(0),
  invalidRecords: int('invalid_records').notNull().default(0),
  errorSummary: text('error_summary'),
  createdAt: datetime('created_at', { mode: 'date' }).notNull().default(new Date()),
  completedAt: datetime('completed_at', { mode: 'date' })
}, table => [index('imports_client_date_idx').on(table.clientId, table.createdAt)])

export const syncJobs = mysqlTable('sync_jobs', {
  id: varchar('id', { length: 36 }).primaryKey(),
  clientId: varchar('client_id', { length: 36 }).notNull().references(() => clients.id, { onDelete: 'cascade' }),
  sourceType: varchar('source_type', { length: 32 }).notNull(),
  status: varchar('status', { length: 32 }).notNull(),
  lockKey: varchar('lock_key', { length: 190 }).notNull(),
  lockedUntil: datetime('locked_until', { mode: 'date' }),
  startedAt: datetime('started_at', { mode: 'date' }).notNull(),
  endedAt: datetime('ended_at', { mode: 'date' }),
  lastSuccessfulAt: datetime('last_successful_at', { mode: 'date' }),
  ...timestamps
}, table => [index('sync_jobs_lock_idx').on(table.lockKey, table.lockedUntil)])

export const syncLogs = mysqlTable('sync_logs', {
  id: varchar('id', { length: 36 }).primaryKey(),
  clientId: varchar('client_id', { length: 36 }).notNull().references(() => clients.id, { onDelete: 'cascade' }),
  syncJobId: varchar('sync_job_id', { length: 36 }).references(() => syncJobs.id, { onDelete: 'set null' }),
  sourceType: varchar('source_type', { length: 32 }).notNull(),
  status: varchar('status', { length: 32 }).notNull(),
  startedAt: datetime('started_at', { mode: 'date' }).notNull(),
  endedAt: datetime('ended_at', { mode: 'date' }),
  rowsChecked: int('rows_checked').notNull().default(0),
  createdRecords: int('created_records').notNull().default(0),
  updatedRecords: int('updated_records').notNull().default(0),
  duplicateRecords: int('duplicate_records').notNull().default(0),
  failedRecords: int('failed_records').notNull().default(0),
  errorMessage: text('error_message')
}, table => [index('sync_logs_client_date_idx').on(table.clientId, table.startedAt)])

export const syncEvents = mysqlTable('sync_events', {
  id: varchar('id', { length: 36 }).primaryKey(),
  syncLogId: varchar('sync_log_id', { length: 36 }).notNull().references(() => syncLogs.id, { onDelete: 'cascade' }),
  eventType: varchar('event_type', { length: 32 }).notNull(),
  sourceRowNumber: int('source_row_number'),
  recordKey: varchar('record_key', { length: 190 }),
  message: varchar('message', { length: 500 }).notNull(),
  createdAt: datetime('created_at', { mode: 'date' }).notNull().default(new Date())
}, table => [index('sync_events_log_idx').on(table.syncLogId, table.eventType)])
