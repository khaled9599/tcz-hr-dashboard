# KOG Client Performance Dashboard

Phase 1 of the future TCZ CRM client workspace. This Nuxt application gives KOG a secure view of media spend, leads submitted, CPL, qualified leads, CPQL, campaign efficiency, and lead quality.

The product uses the [Nuxt UI dashboard template](https://github.com/nuxt-ui-templates/dashboard) as its technical foundation and the TCZ dashboard skill repository as its brand and decision-design source. The application itself is intentionally separate from the reusable skill.

## Local review

```bash
cp .env.example .env
# Replace SESSION_SECRET and the demo credentials in .env
pnpm install
pnpm dev
```

Demo mode is allowed only outside production. Production requires MySQL, migrations, a seeded user, and `NUXT_DEMO_MODE=false`.

## Production commands

```bash
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm build
node .output/server/index.mjs
```

## Quality checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

See `docs/DEPLOYMENT.md` for Hostinger setup and `docs/GOOGLE_SHEETS_SYNC.md` for Google service-account configuration.
