import { mkdirSync, readdirSync, readFileSync, writeFileSync, statSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const packagesDir = join(root, "packages")
const outDir = join(root, "dist")
const outPath = join(outDir, "website-catalog.v0.json")

const themes = []
for (const name of readdirSync(packagesDir)) {
  const dir = join(packagesDir, name)
  if (!statSync(dir).isDirectory()) continue
  const manifest = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8"))
  themes.push({
    id: manifest.id,
    title: manifest.title,
    version: manifest.version,
    description: manifest.description,
    aspects: manifest.aspects,
    fiction: manifest.fiction === true,
    token_contract_version: manifest.token_contract_version,
    source_package: `packages/${manifest.id}`,
  })
}

themes.sort((a, b) => a.id.localeCompare(b.id))

const catalog = {
  schema_version: "0.1.0",
  generated_for: "website",
  themes,
}

mkdirSync(outDir, { recursive: true })
writeFileSync(outPath, `${JSON.stringify(catalog, null, 2)}\n`)
console.log(`THEMES_WEBSITE_CATALOG_OK themes=${themes.length}`)
