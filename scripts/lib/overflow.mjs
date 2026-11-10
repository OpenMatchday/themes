/**
 * Overflow estimates for long and non-ASCII names against declared slot widths.
 * Uses avg_glyph_em * codepoint count; not a full shaping engine.
 */

export const codepointLength = (text) => [...text].length

export const estimateWidthEm = (text, avgGlyphEm) =>
  codepointLength(text) * avgGlyphEm

export const fitsSlot = (text, slotWidthEm, avgGlyphEm) =>
  estimateWidthEm(text, avgGlyphEm) <= slotWidthEm

export const assertOverflowFixtures = (typography, fixtures) => {
  const errors = []
  const { strategy, max_name_codepoints: maxCp, avg_glyph_em: avgEm } =
    typography.overflow
  const slotWidthEm = maxCp * avgEm

  for (const fixture of fixtures) {
    const len = codepointLength(fixture.text)
    if (len > maxCp && strategy !== "ellipsis" && strategy !== "shrink") {
      errors.push(
        `${fixture.id}: ${len} codepoints exceeds max ${maxCp} without ellipsis/shrink`
      )
    }
    const width = estimateWidthEm(fixture.text, avgEm)
    if (width > slotWidthEm && !["ellipsis", "shrink", "wrap"].includes(strategy)) {
      errors.push(
        `${fixture.id}: estimated width ${width.toFixed(3)}em exceeds slot ${slotWidthEm.toFixed(3)}em`
      )
    }
    if (!fixture.expects_overflow && width > slotWidthEm) {
      errors.push(
        `${fixture.id}: unexpected overflow (width ${width.toFixed(3)}em > ${slotWidthEm.toFixed(3)}em)`
      )
    }
    if (fixture.expects_overflow && width <= slotWidthEm) {
      errors.push(
        `${fixture.id}: expected overflow but width ${width.toFixed(3)}em fits`
      )
    }
  }
  return errors
}
