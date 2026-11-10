# Theme import / export

Bundle format: `open-matchday.theme.bundle` version `0.1.0`.

## Export

```bash
npm run export -- packages/matchday-neutral
```

Writes `dist/matchday-neutral-0.1.0.omtheme.json` containing declarative package files plus overflow fixtures. Export validates the package first.

## Import

```bash
npm run import -- dist/matchday-neutral-0.1.0.omtheme.json tmp/restored-theme
```

Materializes JSON files, docs stub, and fixtures, then re-validates (schema, WCAG contrast, overflow, font licenses, no executables).

## Editor note

This CLI is the guided import/export surface for OM-024. A visual guided theme editor in `app` remains a later task; contribution via PR is documented in [contributing.md](contributing.md).
