---
name: tcz-hr-dashboard
description: Create or redesign responsive HR dashboards for The Creative Zone using the supplied TCZ logos, fonts, palette, and interface rules. Use for HR portals, people analytics, recruitment, attendance, leave, performance, learning, or employee self-service interfaces. Do not use for unrelated TCZ campaign or event artwork.
---

# TCZ HR Dashboard

Build a clear, credible HR product that feels like The Creative Zone. Treat the bundled brand files as authoritative assets. Treat the dashboard as an operational product, so usability, privacy, and data accuracy come before decoration.

## Start from the request

Identify the intended users, decisions, modules, data source, required filters, and delivery format. If critical inputs are missing, ask only for choices that materially change the product. For an exploratory prototype, proceed with clearly labeled sample data and make assumptions visible.

Read [references/brand-system.md](references/brand-system.md) before designing the interface. Read [references/hr-dashboard-blueprint.md](references/hr-dashboard-blueprint.md) when deciding modules, KPIs, permissions, or states. Read [references/dashboard-design-method.md](references/dashboard-design-method.md) before defining pages, charts, filters, or drill-down behavior. Read [references/dashboard-implementation-patterns.md](references/dashboard-implementation-patterns.md) when building a working web dashboard or choosing a project structure.

## Design around decisions

Before laying out screens, create a compact decision map for each audience:

1. What question must this person answer?
2. What evidence do they need?
3. What action follows the answer?
4. What level of detail are they authorized to see?

Name pages around the decision or task when possible, not only the data domain. Adjust density to the audience. Leadership needs a rapid overview and exceptions. HR operations needs queues, detail, and bulk actions. Analysts need drill-down, comparison, and export controls.

## Build the interface

- Use the provided Helvetica Now Display files through `@font-face`. Provide Arial or a neutral sans-serif fallback.
- Use TCZ orange as the primary action, selection, and emphasis color. Do not flood the interface with orange.
- Use black or near-black for navigation and high-emphasis surfaces. Use the warm off-white and grays for the main workspace, borders, and secondary information.
- Prefer a strong editorial hierarchy, generous space, crisp grids, and restrained motion. The brand can feel bold without making HR workflows theatrical.
- Use the supplied black logo on light surfaces and the supplied white logo on dark surfaces. Never redraw, stretch, outline, recolor, or place the logo on a low-contrast background.
- Make data tables dense but readable. Keep labels short. Show units, comparison periods, data freshness, and filter scope.
- Use charts only when they improve a decision. Pair visual encodings with exact values, labels, or accessible summaries.
- Give charts conclusion-led titles when the evidence supports a conclusion. Use a neutral descriptive title when the data is exploratory or inconclusive.
- Keep the current date range, department, location, and other active filters visible. Provide a clear reset action. For implemented web products, make useful filter and tab states shareable through the URL when appropriate.
- Use dynamic page context so users can always tell what period, team, or segment they are viewing.
- Support desktop and mobile layouts. Preserve primary tasks, filters, and approvals on small screens instead of merely shrinking the desktop view.
- Implement empty, loading, error, no-permission, and stale-data states for every data-dependent module.

## HR data rules

- Never invent real employee records. Use fictional, clearly labeled demo data unless the user supplies data.
- Apply role-based access. An employee, manager, HR partner, recruiter, finance user, and administrator should not see the same detail.
- Default to aggregated analytics. Reveal identifiable employee information only when the workflow requires it and the user is authorized.
- Avoid exposing compensation, disciplinary, health, demographic, national ID, bank, or contact data in overview screens.
- Do not imply causation from correlation. Explain KPI formulas when metrics such as attrition, absenteeism, or engagement can be interpreted differently.
- Never use color alone to communicate status. Pair it with text or an icon.
- Expose data freshness, completeness, and known gaps. Mark estimated or backfilled values directly in the interface. Add a dedicated data-quality view when several sources or recurring quality issues affect decisions.

## Delivery

Use the user's requested framework. If none is specified, choose a maintainable responsive web stack that fits the surrounding project. Reuse `assets/design-tokens.css` or translate its values into the project's token system. Keep all asset paths portable and relative.

If the existing project uses Nuxt or Vue, the official Nuxt UI dashboard template is an appropriate structural reference. Rebuild its visual layer with TCZ tokens and HR-specific workflows. Do not import the template's demo branding, sales data, navigation labels, or default color theme.

Before handoff, verify layout at common desktop and mobile widths, keyboard access, contrast, chart labels, responsive tables, privacy boundaries, all data states, persistent filter context, and honest data-quality messaging. For large tables, test pagination or virtualization. List assumptions and any connections still needed for live data.

## Assets

- `assets/tcz-logo-black.png`: black logo for light surfaces
- `assets/tcz-logo-white.png`: white raster logo for dark surfaces
- `assets/tcz-logo-white.svg`: scalable white logo
- `assets/HelveticaNowDisplay-Regular.ttf`: body and UI text
- `assets/HelveticaNowDisplay-Medium.ttf`: headings, labels, and emphasis
- `assets/tcz-color-palette.png`: supplied palette reference
- `assets/tcz-brand-reference.pdf`: supplied TCZ visual reference
- `assets/design-tokens.css`: starter web tokens
