# Decision-led dashboard method

Use this reference when defining dashboard pages, information density, navigation, filters, and visualizations.

## 1. Frame the decision

Every page should help a defined audience answer a question or complete an action. Record this before designing:

| Field | Example |
| --- | --- |
| Audience | HR operations lead |
| Question | Which attendance exceptions need intervention today? |
| Evidence | Unresolved absence, lateness, missing check-out, shift, manager |
| Action | Review, assign, approve, or contact manager |
| Detail level | Named employee records within authorized departments |

Do not add a page or widget because data exists. Add it when it supports a decision, task, explanation, or required record.

## 2. Set density by audience

| Audience | Default density | Design emphasis |
| --- | --- | --- |
| Leadership | Low to medium | Status, change, risk, exceptions, next action |
| HR partner or manager | Medium | Team comparison, approvals, drill-down |
| HR operations | Medium to high | Work queues, filters, bulk actions, audit context |
| Analyst | High | Definitions, segmentation, comparison, export |
| Employee | Low | Personal status and immediate self-service tasks |

Progressive disclosure should reveal detail without forcing all audiences into the same dense view.

## 3. Establish context and navigation

- Keep global and page-level filters visually distinct.
- Display active scope near the page title, such as `Cairo Office · Creative Team · Q3 2026`.
- Provide a visible reset control when multiple filters can combine.
- Preserve useful filters, tabs, pagination, and expanded views in the URL for shareable web dashboards when privacy rules allow.
- Do not place sensitive identifiers or values directly in URLs.
- Ensure browser back and forward navigation restores the expected state.

## 4. Choose the simplest valid visual

| User question | Preferred visual |
| --- | --- |
| What is the exact value? | KPI card or table |
| How is it changing over time? | Line chart or compact sparkline |
| Which category is larger? | Sorted horizontal bar chart |
| How does a value compare with a target? | Bullet chart or bar with target marker |
| What is the distribution? | Histogram, box plot, or percentile table |
| Where are time-based attendance patterns? | Heatmap with exact-value tooltip or table alternative |
| How does a process move through stages? | Funnel only for a true sequential pipeline; otherwise stage bars |
| What needs action now? | Ranked exception table or task queue |

Avoid gauges for ordinary KPIs, pies with many categories, dual axes, 3D charts, and decorative charts. Use specialized visuals only when the underlying relationship requires them.

## 5. Write truthful titles and narratives

Use a conclusion-led title only when the evidence is strong and the filters are clear, such as `Late arrivals fell after the schedule change`. Use a descriptive title for exploratory views, such as `Late arrivals by team and week`.

Provide a short plain-language summary for executive or mixed-literacy audiences. It should state the main change, comparison basis, and any important data limitation. Never generate a confident narrative from incomplete or unstable data.

## 6. Show trust signals

At minimum, show the last refresh time and source scope. When data is incomplete, late, estimated, or merged from several systems, expose the issue near the affected metric.

Use a dedicated data-quality view when it improves operational decisions. It may cover:

- Source freshness
- Record completeness
- Unmatched employee or team identifiers
- Invalid date or status values
- Estimated or backfilled records
- Rules used to calculate each quality indicator

Do not invent a quality percentage without a defined, reproducible formula.

## 7. Implementation checks

- Use semantic HTML and native controls before custom interaction patterns.
- Give icon-only controls accessible names.
- Announce asynchronous refreshes and important filter updates appropriately.
- Use locale-aware date and number formatting.
- Apply tabular numerals to KPI values, tables, and chart labels.
- Virtualize or paginate long tables. Do not render large employee lists without a performance strategy.
- Lazy-load charts below the first viewport when it improves performance.
- Respect reduced-motion preferences and never depend on animation to explain a change.
- Verify chart and table behavior at mobile, tablet, and desktop widths.

## Research basis

This method adapts the strongest dashboard-specific principles from the MIT-licensed [Dashboard Design skill by mares29](https://github.com/mares29/dashboard-design-skill). The original skill was reviewed rather than copied wholesale. TCZ branding, HR privacy, role permissions, and the requirements in this package take precedence.
