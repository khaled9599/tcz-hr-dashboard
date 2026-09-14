# Source Repository Audit

## Finding

`khaled9599/tcz-hr-dashboard` is a dashboard skill and TCZ asset package. It does not contain an HR application, app shell, database, pages, or reusable Vue components. It is used here as the authoritative source for TCZ logos, Helvetica Now Display files, palette, design tokens, privacy guidance, and dashboard decision principles.

`nuxt-ui-templates/dashboard` is the application foundation. It provides the responsive Nuxt shell and maintained UI primitives.

## Keep

- Nuxt 4 application structure and Node server output
- Nuxt UI dashboard group, sidebar, panel, and navbar patterns
- Responsive sidebar behavior
- Nuxt UI inputs, buttons, badges, alerts, cards, and skeletons
- Unovis chart integration
- Color mode and accessible component primitives
- ESLint, TypeScript, pnpm lockfile, and build workflow

## Modify

- Sales overview became the KOG performance overview
- Sales KPIs became Leads Submitted, Spend, CPL, Qualified Leads, CPQL, and Conversion Rate
- Customer lists became server-paginated campaign and lead tables
- Generic date range controls became persistent global reporting scope
- Generic green theme became the TCZ orange, black, warm off-white, and gray system
- Team selector became a fixed KOG client workspace identity
- Template profile controls became secure session controls
- Template charts became media, lead, cost, and quality comparisons

## Remove

- Inbox and mail data
- Customers and sales records
- Template teams
- Member administration
- Notification demo
- Template feedback and source-code links
- Vercel-specific deployment promotion
- Random KPI and chart generation
- All unused template endpoints and components

There was no HR application code to remove. No employee, recruitment, attendance, leave, department, candidate, or HR workflow code exists in the finished project.
