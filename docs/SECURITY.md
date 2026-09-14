# Security

## Implemented controls

- Authentication middleware protects all pages except login.
- Every data API independently requires an authenticated session.
- All production queries include server-resolved `client_id` scope.
- Passwords are bcrypt hashes. Session tokens are random and stored only as SHA-256 hashes.
- Cookies are HTTP-only, same-site, secure in production, host-only, and time-limited.
- Google credentials, database URL, session secret, and scheduler secret remain server environment variables.
- Content Security Policy, common security headers, request-size limits, and rate limiting are enabled.
- SQL values use Drizzle or parameterized MySQL queries.
- Spreadsheet and upload rows are validated and normalized before persistence.
- CSV and XLSX files are allowlisted and capped at 10 MB.
- Source file names are sanitized before display or storage.
- Sync and import errors shown to clients omit credentials and stack traces.
- Production rejects demo authentication.

## Deployment requirements

- Use HTTPS only and redirect HTTP at the hosting layer.
- Generate unique values for `SESSION_SECRET` and `SYNC_SECRET`; never reuse a password.
- Use a dedicated MySQL user with access only to the KOG database.
- Keep the repository private because this product handles lead data.
- Back up MySQL before migrations and enable daily backups.
- Rotate Google and session credentials after staff access changes.
- Review exports and future roles before adding additional users.

## Before go-live

Run dependency vulnerability scanning, verify production CSP errors, test session expiry, test client isolation with two seeded clients, verify logs do not include row payloads or secrets, and perform an authenticated upload test using non-sensitive sample data.
