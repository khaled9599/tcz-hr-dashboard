# Hostinger Deployment

Hostinger currently documents managed Node.js support for Business and Cloud plans, explicitly including Nuxt and Node 18, 20, 22, and 24. Its GitHub deployment flow installs dependencies, builds, and restarts the server application. Confirm these options are visible in the target hPanel before changing DNS.

## Recommended settings

- Repository: private `tcz-kog-dashboard`
- Framework: Nuxt.js
- Node.js: 22.x or 24.x
- Package manager: pnpm
- Install: `pnpm install --frozen-lockfile`
- Build: `pnpm build`
- Entry file: `.output/server/index.mjs`
- Domain: `crm.tcz-eg.com`
- Nitro preset: `node-server`

## Provisioning order

1. Create a MySQL 8 database and a least-privilege application user.
2. Add all variables from `.env.example` in hPanel. Set `NODE_ENV=production` and `NUXT_DEMO_MODE=false`.
3. Run `pnpm db:migrate` against the production database from an authorized deployment or maintenance environment.
4. Run `INITIAL_KOG_EMAIL=... INITIAL_KOG_PASSWORD=... pnpm seed` once, then remove the temporary initial-password variables.
5. Connect the GitHub repository and deploy.
6. Verify login, protected redirects, metrics, filters, exports, manual import, and Sync Now using a non-sensitive test sheet.
7. Configure a 30-minute HTTPS scheduler as described in `GOOGLE_SHEETS_SYNC.md`.
8. Point `crm.tcz-eg.com` to the deployed app and verify HTTPS before loading real leads.

Do not edit files inside Hostinger's generated build directory. Its deployment system replaces build output on redeployment; configuration belongs in environment variables and application changes belong in Git.

## Release verification

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Keep the previous successful Hostinger deployment available for rollback. Database schema changes must use committed migrations and be backed up before application rollout.
