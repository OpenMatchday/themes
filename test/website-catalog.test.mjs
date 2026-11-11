import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { spawnSync } from "node:child_process"
import { test } from "node:test"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

test("website catalog export lists declarative themes", () => {
  const result = spawnSync(process.execPath, ["scripts/export-website-catalog.mjs"], {
    cwd: root,
    encoding: "utf8",
  })
  assert.equal(result.status, 0, result.stderr || result.stdout)
  const catalog = JSON.parse(readFileSync(join(root, "dist", "website-catalog.v0.json"), "utf8"))
  assert.ok(catalog.themes.some((t) => t.id === "matchday-neutral"))
  for (const theme of catalog.themes) {
    assert.ok(theme.id)
    assert.ok(theme.title)
    assert.ok(Array.isArray(theme.aspects))
  }
})
