import { mkdirSync, writeFileSync } from "node:fs"
import { basename, dirname, join, resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { rootDir } from "./lib/load-ajv.mjs"
import { REQUIRED_FILES, readJson } from "./lib/package-layout.mjs"
import { validatePackageDir } from "./lib/validate-package.mjs"

const BUNDLE_FORMAT = "open-matchday.theme.bundle"
const BUNDLE_VERSION = "0.1.0"

export const buildThemeBundle = (packageDir) => {
  validatePackageDir(packageDir, { expectValid: true })
  const packageFiles = {}
  for (const rel of REQUIRED_FILES) {
    packageFiles[rel] = readJson(join(packageDir, rel))
  }
  const overflowFixture = readJson(
    join(packageDir, "fixtures", "overflow-names.json")
  )
  return {
    format: BUNDLE_FORMAT,
    format_version: BUNDLE_VERSION,
    exported_at_note:
      "Deterministic content only; no wall-clock stamp in bundle body hashes.",
    package_id: packageFiles["manifest.json"].id,
    package_version: packageFiles["manifest.json"].version,
    files: packageFiles,
    fixtures: {
      "overflow-names.json": overflowFixture,
    },
  }
}

const isMain =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href

if (isMain) {
  const packageArg = process.argv[2]
  const outArg = process.argv[3]
  if (!packageArg) {
    console.error(
      "usage: node scripts/export-theme.mjs <package-dir> [out.omtheme.json]"
    )
    process.exit(1)
  }
  const packageDir = resolve(rootDir, packageArg)
  const bundle = buildThemeBundle(packageDir)
  const outPath =
    outArg ??
    join(
      rootDir,
      "dist",
      `${bundle.package_id}-${bundle.package_version}.omtheme.json`
    )
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8")
  console.log(`EXPORT_OK ${basename(outPath)} package=${bundle.package_id}`)
}
