# Contributing theme packages

## Workflow

1. Fork [OpenMatchday/themes](https://github.com/OpenMatchday/themes).
2. Copy `packages/matchday-neutral/` to `packages/<your-id>/`.
3. Edit declarative JSON only. Do not add scripts or binaries to the package.
4. Cite font licenses in `fonts.json`. Prefer CSS generic families unless a font file license is clear and redistributable.
5. Add overflow fixtures with a long ASCII name and a non-ASCII name.
6. Run locally:

```bash
npm ci
npm run check
npm run validate
npm test
```

7. Open a pull request against `main`. Describe the visual intent, contrast pairs, and font licenses.
8. CI must pass schema check, package validation, tests, and typecheck.

## Guided editor path (AC-8.4)

Until the in-app guided theme editor ships, use the CLI import/export tools as the guided contribution path:

```bash
npm run export -- packages/<id>
npm run import -- dist/<id>-<version>.omtheme.json packages/<id>
```

See [import-export.md](import-export.md). Website contribution wizard for themes is planned with later catalog tasks; PR-based contribution is supported now.
