# Data Model

| Table | Purpose | Important boundaries |
| --- | --- | --- |
| `clients` | Tenant and client configuration | Slug, timezone, currency |
| `users` | Authenticated people | Email, bcrypt password hash, account role |
| `user_clients` | User-to-client membership | Enables future multiple clients and roles |
| `sessions` | Revocable sessions | Hashed token, expiry, last seen, IP and agent metadata |
| `campaigns` | Canonical campaign identity | Source ID plus normalized-name fallback |
| `performance_records` | Daily media facts | Spend, reach, impressions, clicks, link clicks |
| `leads` | Submitted lead facts | Source ID, dedupe key, row hash, statuses, custom fields |
| `imports` | Manual import audit | Counts, source file, status, errors |
| `sync_jobs` | Synchronization run and lock state | Lock key and expiry prevent overlap |
| `sync_logs` | Run-level sync evidence | Checked, new, updated, duplicate, failed counts |
| `sync_events` | Row-level notable events | Duplicate and validation traceability |

## Metric definitions

- CPL = spend / leads submitted
- CPQL = spend / qualified leads
- Conversion rate = converted leads / leads submitted
- Qualification rate = qualified leads / valid leads where shown in lead analysis
- CTR = clicks / impressions
- CPC = spend / clicks
- CPM = spend / impressions × 1,000
- Frequency = impressions / reach

All divide-by-zero cases return zero. All formulas are centralized in `server/domain/analytics.ts`.

## Lead identity

The strongest available source lead ID is used first. Without one, the system hashes normalized contact, submission minute, form, and campaign. Status and qualification are excluded from this identity so an updated spreadsheet row updates the existing record. A row-content hash determines whether a matched record changed or is an unchanged duplicate.
