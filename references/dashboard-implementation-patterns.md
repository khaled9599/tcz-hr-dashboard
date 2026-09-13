# Dashboard implementation patterns

Use this reference when the deliverable is a working dashboard rather than a static concept.

## Framework routing

Respect the user's selected framework and the existing project. Do not migrate a working product merely to use a preferred template.

For Nuxt or Vue projects, the MIT-licensed [Nuxt UI Dashboard Template](https://github.com/nuxt-ui-templates/dashboard) is a strong optional structural reference. It is useful for application composition, not as a visual identity. TCZ tokens, content, information architecture, and permission rules remain authoritative.

## Application shell

Build the shell from stable reusable regions:

- Responsive, collapsible sidebar
- Persistent page header
- Contextual toolbar for filters and actions
- Main dashboard panel
- Notifications or approval drawer
- Search or command interface when the product has enough pages or records to justify it
- User, team, or workspace switcher only when multiple scopes exist

On mobile, convert the sidebar into a controlled drawer. Keep the current page, active scope, and primary action visible. A resizable desktop sidebar is optional and should remember the user's preference.

## Page and component boundaries

- Keep page files focused on composition, permissions, and routing.
- Put KPI groups, charts, tables, filters, forms, and drawers in dedicated components.
- Put shared dashboard state in a small composable or store. Do not place unrelated business data in one global object.
- Keep API records typed and validate mutations at the boundary.
- Separate real API adapters from demo-data generators so a prototype can be connected later without rewriting the UI.

## Charts in rendered applications

When server-side rendering is active and a chart library requires the browser:

- Render the chart client-side.
- Reserve the final chart dimensions on the server to prevent layout shift.
- Provide a meaningful loading state and a text or table alternative.
- Format dates and numbers with the active locale.
- Recalculate dimensions from the container rather than hardcoding the viewport width.

Do not generate random KPI or chart values during normal rendering. Use a deterministic fixture in demos and label it clearly.

## Operational tables

Employee, candidate, attendance, and approval tables should support only the controls needed for the workflow. Common capabilities include:

- Search and field-specific filters
- Sorting with clear active state
- Column visibility for role-specific workflows
- Row selection with an explicit selected count
- Bulk actions with permission checks and confirmation
- Pagination or virtualization
- Loading, empty, error, partial-data, and no-permission states
- Row actions with specific labels
- A compact mobile list or priority-column view instead of a crushed wide table

Selection must apply to the visible filtered result unless the interface explicitly offers `Select all matching records`. Explain the scope before bulk actions.

## Forms and mutations

- Validate input with an explicit schema.
- Keep labels visible and errors close to the affected field.
- Confirm destructive actions and explain their scope.
- Show mutation progress and final success or recovery guidance.
- Prevent duplicate submissions.
- Refresh or reconcile affected widgets after a successful mutation.
- Record audit context for sensitive HR changes.

## Navigation and shortcuts

Keyboard shortcuts and a command palette can improve speed for frequent HR users. Treat them as optional enhancements:

- Keep all tasks available without shortcuts.
- Make shortcuts discoverable through tooltips or help.
- Avoid conflicts with browser and assistive-technology commands.
- Close temporary drawers or overlays when navigation changes.
- Keep focus in a predictable location after route changes.

## TCZ adaptation checklist

- Replace all default framework colors with the TCZ token system.
- Use the supplied TCZ wordmark rather than a template mark.
- Replace sales, customer, and inbox examples with approved HR modules.
- Preserve TCZ typography across framework components.
- Use orange for emphasis and action, not as a full-page wash.
- Keep dark navigation and light operational surfaces consistent.
- Test the adapted design in both collapsed and expanded navigation states.

## Rejected implementation reference

[Reportr/dashboard](https://github.com/Reportr/dashboard) was reviewed but should not be used as a code base. Its implementation targets Node 0.10 and dependencies from the 2014 era. Its configurable visualization and alert concepts are already covered more safely by modular widgets, work queues, and notification patterns in this skill.
