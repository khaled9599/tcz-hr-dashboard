# Google Sheets Synchronization

## Required configuration

1. Create a Google Cloud service account with read-only Sheets API access.
2. Enable the Google Sheets API in that project.
3. Share the assigned KOG sheet with `GOOGLE_SERVICE_ACCOUNT_EMAIL` as a viewer.
4. Add `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`, and `GOOGLE_SHEET_RANGE` to production environment variables.
5. Generate a separate `SYNC_SECRET` of at least 32 random bytes.

Google credentials are read only by the server and never returned to the browser.

## Run sequence

1. Acquire a client-specific MySQL named lock.
2. Create a running job and log.
3. Read the configured range once.
4. Treat the first row as headers and map known aliases.
5. Validate submission time and contact identity.
6. Prefer source lead ID, otherwise build the composite dedupe key.
7. Compare the stable row hash.
8. Insert new leads, update changed leads, and count unchanged duplicates.
9. Store custom columns in `custom_fields`.
10. Complete the log and release the lock.

Failures never delete leads or reset metrics. A failed run records its error and leaves the last successful dataset intact.

## Schedule

Configure a scheduler to call every 30 minutes:

```text
POST https://crm.tcz-eg.com/api/sync/google-sheet?clientId=<KOG_CLIENT_UUID>
Authorization: Bearer <SYNC_SECRET>
```

Use a scheduler that can send HTTPS POST requests with an Authorization header. The endpoint is also suitable for a future Apps Script reconciliation trigger. A future Google Form webhook should call a separate ingestion endpoint and leave this job as reconciliation.

## Recognized lead headings

Aliases cover common forms of Lead ID, Submitted At, Name, Phone, Email, Campaign, Platform, Source, Form, Location, Lead Status, and Qualification Status. Unrecognized columns are preserved as dynamic custom fields.
