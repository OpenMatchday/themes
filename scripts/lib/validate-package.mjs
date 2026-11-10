import { join, relative, sep } from "node:path"
import { assertContrastPairs } from "./contrast.mjs"
import { loadCatalog, loadTokenContract, rootDir, createAjv } from "./load-ajv.mjs"
import { assertOverflowFixtures } from "./overflow.mjs"
import {
  assertLayout,
  findExecutableFiles,
  listFixtureJson,
  readJson,
} from "./package-layout.mjs"

const toPosix = (p) => p.split(sep).join("/")

const REQUIRED_ASPECTS = new Set(["16:9", "9:16", "1:1"])
const CSS_GENERIC_FAMILIES = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-serif",
  "ui-sans-serif",
  "ui-monospace",
  "ui-rounded",
  "emoji",
  "math",
  "fangsong",
])

const validateData = (ajv, schemaId, data, label) => {
  const validate = ajv.getSchema(schemaId)
  if (!validate) {
    throw new Error(`missing schema ${schemaId}`)
  }
  if (!validate(data)) {
    throw new Error(`${label}: ${ajv.errorsText(validate.errors)}`)
  }
}

const loadOverflowFixtures = (packageDir) => {
  const out = []
  for (const file of listFixtureJson(packageDir)) {
    const data = readJson(file)
    if (data.kind !== "overflow_names") {
      continue
    }
    if (!Array.isArray(data.names)) {
      throw new Error(`${basenameSafe(file)}: overflow_names needs names[]`)
    }
    for (const row of data.names) {
      out.push({
        id: `${basenameSafe(file)}:${row.id}`,
        text: row.text,
        expects_overflow: Boolean(row.expects_overflow),
      })
    }
  }
  return out
}

const basenameSafe = (file) => file.split(/[/\\]/).pop()

export const validatePackageDir = (packageDir, { expectValid }) => {
  const ajv = createAjv()
  const catalog = loadCatalog()
  const contract = loadTokenContract()
  const label = toPosix(relative(rootDir, packageDir))
  const layoutErrors = assertLayout(packageDir)
  if (expectValid && layoutErrors.length > 0) {
    throw new Error(`${label} layout: ${layoutErrors.join("; ")}`)
  }
  if (!expectValid && layoutErrors.length > 0) {
    return { label, ok: false, reason: `layout: ${layoutErrors.join("; ")}` }
  }

  try {
    for (const [rel, schemaId] of Object.entries(catalog.package_file_schemas)) {
      const data = readJson(join(packageDir, rel))
      validateData(ajv, schemaId, data, `${label}/${rel}`)
    }

    const execFiles = findExecutableFiles(packageDir)
    if (execFiles.length > 0) {
      throw new Error(
        `${label}: executable files forbidden: ${execFiles
          .map((f) => toPosix(relative(packageDir, f)))
          .join(", ")}`
      )
    }

    const manifest = readJson(join(packageDir, "manifest.json"))
    const aspectSet = new Set(manifest.aspects)
    for (const a of REQUIRED_ASPECTS) {
      if (!aspectSet.has(a)) {
        throw new Error(`${label}: missing aspect ${a}`)
      }
    }
    if (manifest.token_contract_version !== contract.contract_version) {
      throw new Error(`${label}: token_contract_version mismatch`)
    }

    const colorsDoc = readJson(join(packageDir, "colors.json"))
    const tokensDoc = readJson(join(packageDir, "tokens.json"))
    const typography = readJson(join(packageDir, "typography.json"))
    const fonts = readJson(join(packageDir, "fonts.json"))

    for (const req of contract.required_tokens) {
      if (!(req.key in tokensDoc.tokens)) {
        throw new Error(`${label}: tokens missing required key ${req.key}`)
      }
    }

    for (const req of contract.required_tokens.filter((t) => t.role === "color")) {
      if (!(req.key in colorsDoc.colors)) {
        throw new Error(`${label}: colors missing required key ${req.key}`)
      }
      if (tokensDoc.tokens[req.key] !== colorsDoc.colors[req.key]) {
        throw new Error(
          `${label}: token ${req.key} must equal colors.${req.key}`
        )
      }
    }

    const fontFamilyToken = tokensDoc.tokens["font.family"]
    const primaryFamily = typography.families["font.family"]
    if (!primaryFamily) {
      throw new Error(`${label}: typography.families must include font.family`)
    }
    if (fontFamilyToken !== primaryFamily.stack) {
      throw new Error(`${label}: tokens.font.family must equal typography stack`)
    }
    if (!(primaryFamily.font_entry in fonts.entries)) {
      throw new Error(
        `${label}: typography font_entry ${primaryFamily.font_entry} missing in fonts.json`
      )
    }

    for (const [entryId, entry] of Object.entries(fonts.entries)) {
      if (!entry.spdx_license_id || !entry.license_url) {
        throw new Error(`${label}: font ${entryId} missing license fields`)
      }
      if (entry.source === "css_generic") {
        if (!CSS_GENERIC_FAMILIES.has(entry.family)) {
          throw new Error(
            `${label}: font ${entryId} family ${entry.family} is not a CSS generic family`
          )
        }
        if (entry.spdx_license_id !== "LicenseRef-CSS-generic-font-family") {
          throw new Error(
            `${label}: css_generic font ${entryId} must use LicenseRef-CSS-generic-font-family`
          )
        }
      }
      if (
        entry.source === "file" &&
        entry.spdx_license_id.startsWith("LicenseRef-CSS")
      ) {
        throw new Error(
          `${label}: file font ${entryId} cannot use CSS-generic license marker`
        )
      }
    }

    const pairErrors = assertContrastPairs(
      colorsDoc.colors,
      colorsDoc.contrast_pairs
    )
    if (pairErrors.length > 0) {
      throw new Error(`${label}: ${pairErrors.join("; ")}`)
    }

    for (const req of contract.required_contrast_pairs) {
      const found = colorsDoc.contrast_pairs.some(
        (p) =>
          p.fg === req.fg && p.bg === req.bg && p.min_ratio >= req.min_ratio
      )
      if (!found) {
        throw new Error(
          `${label}: missing required contrast pair ${req.fg}/${req.bg} >= ${req.min_ratio}`
        )
      }
    }

    const overflowFixtures = loadOverflowFixtures(packageDir)
    if (overflowFixtures.length < 2) {
      throw new Error(
        `${label}: need overflow fixtures with long and non-ASCII names`
      )
    }
    const hasLong = overflowFixtures.some((f) => [...f.text].length >= 40)
    const hasNonAscii = overflowFixtures.some((f) =>
      /[^\u0000-\u007f]/.test(f.text)
    )
    if (!hasLong || !hasNonAscii) {
      throw new Error(
        `${label}: overflow fixtures must include long ASCII and non-ASCII names`
      )
    }
    const overflowErrors = assertOverflowFixtures(typography, overflowFixtures)
    if (overflowErrors.length > 0) {
      throw new Error(`${label}: overflow: ${overflowErrors.join("; ")}`)
    }

    return { label, ok: true }
  } catch (err) {
    if (expectValid) {
      throw err
    }
    return { label, ok: false, reason: err.message }
  }
}
