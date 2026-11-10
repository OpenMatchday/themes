/**
 * WCAG 2.2 relative luminance and contrast ratio.
 * Sources:
 * - https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 * - https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio
 * - https://www.w3.org/TR/WCAG22/#contrast-minimum (SC 1.4.3 Level AA)
 */

const HEX_RE = /^#[0-9A-Fa-f]{6}$/

export const parseHexColor = (hex) => {
  if (typeof hex !== "string" || !HEX_RE.test(hex)) {
    throw new Error(`invalid hex color: ${hex}`)
  }
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  }
}

const channelToLinear = (c8) => {
  const c = c8 / 255
  if (c <= 0.04045) {
    return c / 12.92
  }
  return ((c + 0.055) / 1.055) ** 2.4
}

export const relativeLuminance = (hex) => {
  const { r, g, b } = parseHexColor(hex)
  const R = channelToLinear(r)
  const G = channelToLinear(g)
  const B = channelToLinear(b)
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

export const contrastRatio = (hexA, hexB) => {
  const l1 = relativeLuminance(hexA)
  const l2 = relativeLuminance(hexB)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * WCAG: do not round when comparing to threshold (4.499 fails 4.5).
 */
export const meetsContrast = (hexFg, hexBg, minRatio) =>
  contrastRatio(hexFg, hexBg) >= minRatio

export const assertContrastPairs = (colors, pairs) => {
  const errors = []
  for (const pair of pairs) {
    const fg = colors[pair.fg]
    const bg = colors[pair.bg]
    if (!fg) {
      errors.push(`contrast pair missing fg color token ${pair.fg}`)
      continue
    }
    if (!bg) {
      errors.push(`contrast pair missing bg color token ${pair.bg}`)
      continue
    }
    const ratio = contrastRatio(fg, bg)
    if (ratio < pair.min_ratio) {
      errors.push(
        `contrast ${pair.fg}/${pair.bg} ratio ${ratio.toFixed(3)} < ${pair.min_ratio}`
      )
    }
  }
  return errors
}
