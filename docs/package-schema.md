# Theme package schema (v0.1.0)

Sources: PROJECT_SPEC AC-8.2, AC-8.3, AC-8.4; [JSON Schema 2020-12](https://json-schema.org/draft/2020-12/schema); [WCAG 2.2 SC 1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum); [CSS Fonts Module Level 4](https://www.w3.org/TR/css-fonts-4/#generic-font-families); [SemVer](https://semver.org/).

## Layout

Each theme package under `packages/<id>/` must contain:

| Path | Role |
|---|---|
| `manifest.json` | id, SemVer, aspects, fiction, token contract pin |
| `colors.json` | Hex colors + WCAG contrast pairs |
| `typography.json` | Font stacks + overflow strategy |
| `logos.json` | Logo slots |
| `tokens.json` | Flat map for graphics render (must include contract keys) |
| `motion.json` | Motion intensity |
| `fonts.json` | Font license registry |
| `docs/` | Human docs and sources |
| `fixtures/` | Overflow name fixtures (long + non-ASCII) |

Schemas live in `schemas/v0/` and are listed in `schemas/catalog.json`.

## Declarative only (AC-8.2)

- Theme packages may not contain executable files (`.js`, `.mjs`, `.ts`, `.wasm`, shells, etc.).
- Validation lives in the themes repo tooling, not inside packages.
- Themes must not import `graphics` code (REPOS.md). Token keys are pinned by `contracts/theme-tokens.v0.json`.

## Validation (AC-8.3)

- WCAG AA contrast for declared pairs (4.5:1 normal text; 3:1 large text).
- Required pairs from the token contract: `color.text` on `color.panel` and on `color.accent`.
- Overflow fixtures cover long ASCII and non-ASCII names against declared max width.
- Aspects must include `16:9`, `9:16`, and `1:1`.
- Every font entry cites SPDX id + license URL (CSS generics use `LicenseRef-CSS-generic-font-family`).

## Commands

```bash
npm ci
npm run check
npm run validate
npm test
npm run export -- packages/matchday-neutral
npm run import -- dist/matchday-neutral-0.1.0.omtheme.json tmp/imported-theme
```
