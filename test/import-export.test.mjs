import assert from "node:assert/strict"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, it } from "node:test"
import { buildThemeBundle } from "../scripts/export-theme.mjs"
import { materializeThemeBundle } from "../scripts/import-theme.mjs"
import { rootDir } from "../scripts/lib/load-ajv.mjs"
import { validatePackageDir } from "../scripts/lib/validate-package.mjs"

describe("theme import/export", () => {
  it("round-trips matchday-neutral through omtheme bundle", () => {
    const bundle = buildThemeBundle(
      join(rootDir, "packages", "matchday-neutral")
    )
    assert.equal(bundle.format, "open-matchday.theme.bundle")
    assert.equal(bundle.package_id, "matchday-neutral")

    const dest = mkdtempSync(join(tmpdir(), "om-theme-"))
    try {
      materializeThemeBundle(bundle, dest)
      const result = validatePackageDir(dest, { expectValid: true })
      assert.equal(result.ok, true)
    } finally {
      rmSync(dest, { recursive: true, force: true })
    }
  })
})
