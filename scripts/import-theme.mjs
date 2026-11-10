import { mkdirSync, writeFileSync } from "node:fs"
import { basename, join, resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { rootDir } from "./lib/load-ajv.mjs"
import { REQUIRED_FILES, readJson } from "./lib/package-layout.mjs"
import { validatePackageDir } from "./lib/validate-package.mjs"

const BUNDLE_FORMAT = "open-matchday.theme.bundle"
const BUNDLE_VERSION = "0.1.0"

export const materializeThemeBundle = (bundle, destDir) => {
  if (bundle.format !== BUNDLE_FORMAT) {
    throw new Error(`unsupported format ${bundle.format}`)
  }
  if (bundle.format_version !== BUNDLE_VERSION) {
    throw new Error(`unsupported format_version ${bundle.format_version}`)
  }
  if (!bundle.files || typeof bundle.files !== "object") {
    throw new Error("bundle.files required")
  }
  for (const rel of REQUIRED_FILES) {
    if (!(rel in bundle.files)) {
      throw new Error(`bundle missing ${rel}`)
    }
  }

  mkdirSync(join(destDir, "docs"), { recursive: true })
  mkdirSync(join(destDir, "fixtures"), { recursive: true })

  for (const rel of REQUIRED_FILES) {
    writeFileSync(
      join(destDir, rel),
      `${JSON.stringify(bundle.files[rel], null, 2)}\n`,
      "utf8"
    )
  }

  writeFileSync(
    join(destDir, "docs", "README.md"),
    `# ${bundle.package_id}\n\nImported theme package bundle ${bundle.package_version}.\n`,
    "utf8"
  )

  const overflow =
    bundle.fixtures?.["overflow-names.json"] ??
    ({
      kind: "overflow_names",
      names: [
        {
          id: "long_ascii",
          text: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          expects_overflow: true,
        },
        {
          id: "non_ascii",
          text: "東京バスケットボールクラブ延長名称テスト",
          expects_overflow: true,
        },
      ],
    })
  writeFileSync(
    join(destDir, "fixtures", "overflow-names.json"),
    `${JSON.stringify(overflow, null, 2)}\n`,
    "utf8"
  )

  validatePackageDir(destDir, { expectValid: true })
  return destDir
}

const isMain =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href

if (isMain) {
  const bundleArg = process.argv[2]
  const destArg = process.argv[3]
  if (!bundleArg || !destArg) {
    console.error(
      "usage: node scripts/import-theme.mjs <bundle.omtheme.json> <dest-dir>"
    )
    process.exit(1)
  }
  const bundle = readJson(resolve(bundleArg))
  const destDir = resolve(rootDir, destArg)
  materializeThemeBundle(bundle, destDir)
  console.log(`IMPORT_OK ${basename(destDir)}`)
}
