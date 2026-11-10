import assert from "node:assert/strict"
import { join } from "node:path"
import { describe, it } from "node:test"
import { rootDir } from "../scripts/lib/load-ajv.mjs"
import { findExecutableFiles } from "../scripts/lib/package-layout.mjs"
import { validatePackageDir } from "../scripts/lib/validate-package.mjs"

describe("theme packages", () => {
  it("accepts matchday-neutral", () => {
    const result = validatePackageDir(
      join(rootDir, "packages", "matchday-neutral"),
      { expectValid: true }
    )
    assert.equal(result.ok, true)
  })

  it("rejects bad contrast", () => {
    const result = validatePackageDir(
      join(rootDir, "fixtures", "packages", "invalid", "bad-contrast"),
      { expectValid: false }
    )
    assert.equal(result.ok, false)
    assert.match(result.reason, /contrast/)
  })

  it("rejects executable theme package files", () => {
    const dir = join(
      rootDir,
      "fixtures",
      "packages",
      "invalid",
      "with-executable"
    )
    assert.ok(findExecutableFiles(dir).length > 0)
    const result = validatePackageDir(dir, { expectValid: false })
    assert.equal(result.ok, false)
    assert.match(result.reason, /executable/)
  })

  it("rejects bad font license marker", () => {
    const result = validatePackageDir(
      join(rootDir, "fixtures", "packages", "invalid", "bad-font-license"),
      { expectValid: false }
    )
    assert.equal(result.ok, false)
    assert.match(result.reason, /LicenseRef-CSS-generic-font-family|css_generic/)
  })

  it("rejects overflow fixture mismatch", () => {
    const result = validatePackageDir(
      join(rootDir, "fixtures", "packages", "invalid", "overflow-mismatch"),
      { expectValid: false }
    )
    assert.equal(result.ok, false)
    assert.match(result.reason, /overflow/)
  })
})
