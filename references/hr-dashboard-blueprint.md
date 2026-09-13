# HR dashboard blueprint

Use only the modules relevant to the brief. Do not turn every dashboard into a full HRIS.

## Recommended information architecture

| Area | Typical content | Primary user |
| --- | --- | --- |
| Overview | Headcount, attendance today, open roles, leave load, urgent approvals | HR leadership |
| People | Directory, employment status, team, location, documents | HR and managers |
| Attendance | Check-ins, lateness, absence, shifts, exceptions | HR operations and managers |
| Leave | Balances, requests, approvals, coverage, calendar | Employees and managers |
| Recruitment | Requisitions, stages, time-to-fill, interviews, offers | Recruiters and hiring managers |
| Performance | Cycles, completion, goals, calibration status | Managers and HR |
| Learning | Enrollment, completion, skills, upcoming sessions | L&D and employees |
| Engagement | Survey participation, themes, pulse trends | HR leadership |
| Reports | Saved views, exports, scheduled reporting | Authorized HR users |
| Settings | Roles, policies, workflows, integrations, audit trail | Administrators |

## Useful KPIs

Show a KPI only when its definition and decision value are clear.

- Active headcount: employees active at the end of the selected period.
- Net headcount change: hires minus exits during the period.
- Voluntary attrition: voluntary exits divided by average headcount for the same period.
- Absence rate: absent scheduled work time divided by total scheduled work time.
- Time to fill: calendar days from approved requisition to accepted offer.
- Offer acceptance: accepted offers divided by total offers issued.
- Review completion: completed reviews divided by assigned reviews.
- Learning completion: completed assigned courses divided by assigned courses.

Display the formula or a tooltip when definitions may vary. Always show the period and last-updated time.

## Roles and privacy

| Role | Default visibility |
| --- | --- |
| Employee | Own profile, leave, attendance, documents, goals, learning |
| Manager | Direct reports and team aggregates, assigned approvals |
| Recruiter | Candidate and requisition data for assigned roles |
| HR partner | Authorized employee groups and HR workflows |
| HR leadership | Aggregated organization analytics and controlled drill-down |
| Payroll or finance | Only fields required for payroll or approved cost analysis |
| Administrator | Configuration and audit tools, not unrestricted browsing by default |

Sensitive values need field-level controls, export restrictions, and an audit trail. Provide a no-permission state instead of hiding failures behind empty cards.

## Interaction priorities

- Put urgent approvals and exceptions before passive metrics.
- Provide global date, department, location, employment type, and status filters only where they change the visible data.
- Let users save useful views when repeated analysis is expected.
- Make table rows keyboard accessible and preserve context when opening employee details.
- Confirm destructive actions and distinguish reversible status changes from permanent deletion.
- For exports, state the included fields and apply the same permissions as the screen.

## Required states

For each widget, table, and workflow include loading, empty, error, stale, partial-data, and no-permission behavior. For forms include validation, saved, conflict, and unsaved-change feedback.

## Prototype data

Use obviously fictional names and label the environment as demo or prototype. Keep sample totals internally consistent across KPI cards, charts, and tables. Never present estimates as live HR data.
