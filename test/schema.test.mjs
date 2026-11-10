import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, it } from "node:test"
import {
  SCHEMA_VERSION,
  createAjv,
  loadCatalog,
  loadTokenContract,
  rootDir,
  SCHEMA_ORDER,
} from "../scripts/lib/load-ajv.mjs"

describe("themes schemas v0", () => {
  it("pins schema version 0.1.0", () => {
    assert.equal(SCHEMA_VERSION, "0.1.0")
    assert.equal(readFileSync(join(rootDir, "VERSION"), "utf8").trim(), "0.1.0")
  })

  it("compiles every non-common schema", () => {
    const ajv = createAjv()
    for (const id of SCHEMA_ORDER) {
      if (id === "common.json") {
        continue
      }
      assert.ok(ajv.getSchema(id), id)
    }
  })

  it("catalog lists the same schema order", () => {
    const catalog = loadCatalog()
    assert.deepEqual(catalog.schemas, SCHEMA_ORDER)
  })

  it("token contract lists required graphics keys", () => {
    const contract = loadTokenContract()
    const keys = contract.required_tokens.map((t) => t.key)
    assert.deepEqual(keys, [
      "color.panel",
      "color.accent",
      "color.text",
      "font.family",
    ])
  })
})
