# Open Matchday -- themes

Declarative theme packages and validation for Open Matchday graphics (AC-8.2, AC-8.3, AC-8.4).

Part of the [OpenMatchday](https://github.com/OpenMatchday) organization.

## Version

Themes SemVer is `0.1.0` (`VERSION`, `package.json`). Token contract pin `0.1.0` mirrors `graphics/contracts/theme-tokens.v0.json`.

## Scope

- Declarative packages only: colors, typography, logo slots, tokens, motion intensity
- No executable files inside theme packages
- WCAG 2.2 AA contrast validation; overflow fixtures; font license registry
- CLI import/export bundles; PR contribution docs

## Commands

```bash
npm ci
npm run check
npm run validate
npm run catalog
npm test
npm run typecheck
npm run export -- packages/matchday-neutral
```

`npm run catalog` writes `dist/website-catalog.v0.json` for the website theme catalog sync.

## Docs

- [Package schema](docs/package-schema.md)
- [Contributing / PR workflow](docs/contributing.md)
- [Import / export](docs/import-export.md)

## License

MIT. See [LICENSE](LICENSE).
