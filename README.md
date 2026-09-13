# TCZ HR Dashboard Skill

A reusable agent skill for designing and building HR dashboards for The Creative Zone.

The package combines TCZ brand assets with dashboard strategy, HR information architecture, privacy controls, accessibility guidance, data-visualization rules, and implementation patterns.

## Included

- TCZ logos and color palette
- Helvetica Now Display font files
- TCZ visual reference PDF
- Reusable CSS design tokens
- HR modules, KPI definitions, and role permissions
- Decision-led dashboard design method
- Responsive implementation patterns
- Optional Nuxt UI dashboard guidance

## Skill structure

```text
SKILL.md
agents/openai.yaml
assets/
references/
```

## Use

Install or load the repository as an agent skill, then invoke:

```text
Use $tcz-hr-dashboard to create a responsive HR dashboard for The Creative Zone.
```

The skill does not require Nuxt. It respects the framework selected by the user or already used by the project. When Nuxt or Vue is selected, it can use the official Nuxt UI dashboard template as a structural reference while replacing its demo content and styling with TCZ requirements.

## Brand ownership

The Creative Zone brand assets and supplied reference materials remain the property of their respective owners. No open-source license is granted for the bundled brand assets or fonts.

## Research references

- [Nuxt UI Dashboard Template](https://github.com/nuxt-ui-templates/dashboard)
- [Dashboard Design Skill](https://github.com/mares29/dashboard-design-skill)
