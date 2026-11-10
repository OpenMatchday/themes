import { existsSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { rootDir } from "./lib/load-ajv.mjs"
import { validatePackageDir } from "./lib/validate-package.mjs"

const listPackageDirs = (base) => {
  if (!existsSync(base)) {
    return []
  }
  return readdirSync(base)
    .map((name) => join(base, name))
    .filter((p) => statSync(p).isDirectory())
}

const shipped = listPackageDirs(join(rootDir, "packages"))
const validFixtures = listPackageDirs(
  join(rootDir, "fixtures", "packages", "valid")
)
const invalidFixtures = listPackageDirs(
  join(rootDir, "fixtures", "packages", "invalid")
)

for (const dir of [...shipped, ...validFixtures]) {
  const result = validatePackageDir(dir, { expectValid: true })
  console.log(`VALID ${result.label}`)
}

for (const dir of invalidFixtures) {
  const result = validatePackageDir(dir, { expectValid: false })
  if (result.ok) {
    throw new Error(`expected invalid package to fail: ${result.label}`)
  }
  console.log(`INVALID_OK ${result.label} :: ${result.reason}`)
}

console.log(
  `VALIDATE_OK shipped=${shipped.length} valid_fixtures=${validFixtures.length} invalid_fixtures=${invalidFixtures.length}`
)
