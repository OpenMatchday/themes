import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  contrastRatio,
  meetsContrast,
  relativeLuminance,
} from "../scripts/lib/contrast.mjs"

describe("WCAG contrast helpers", () => {
  it("computes black/white contrast as 21:1", () => {
    assert.ok(Math.abs(contrastRatio("#000000", "#FFFFFF") - 21) < 1e-9)
  })

  it("passes known AA pair from matchday-neutral", () => {
    assert.equal(meetsContrast("#F5F5F5", "#1A1A1A", 4.5), true)
    assert.equal(meetsContrast("#F5F5F5", "#0B3D2E", 4.5), true)
  })

  it("fails low-contrast greys", () => {
    assert.equal(meetsContrast("#CCCCCC", "#EEEEEE", 4.5), false)
  })

  it("uses WCAG relative luminance weights", () => {
    assert.ok(relativeLuminance("#FFFFFF") > 0.99)
    assert.ok(relativeLuminance("#000000") < 0.01)
  })
})
