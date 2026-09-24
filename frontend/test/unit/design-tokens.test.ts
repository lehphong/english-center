import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
// @ts-expect-error — script Node thuần (.mjs), không có khai báo kiểu
import { renderTokensCss } from '../../scripts/build-tokens.mjs'

interface ColorToken {
  name: string
  value: { light: string; dark: string }
}

// Vitest chạy từ thư mục frontend/
const root = process.cwd()
const tokens = JSON.parse(readFileSync(resolve(root, 'design-system/tokens.json'), 'utf8'))
const colors = Object.fromEntries((tokens.color.tokens as ColorToken[]).map((t) => [t.name, t.value]))

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const linear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * linear(r!) + 0.7152 * linear(g!) + 0.0722 * linear(b!)
}

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi! + 0.05) / (lo! + 0.05)
}

// Các cặp chữ / nền mà README của design system cam kết (WCAG 2: chữ 4.5:1, viền và icon 3:1)
const PAIRS: [fg: string, bg: string, min: number][] = [
  ['ink', 'ground', 4.5],
  ['ink', 'surface', 4.5],
  ['ink', 'surface-sunken', 4.5],
  ['ink-muted', 'ground', 4.5],
  ['ink-muted', 'surface', 4.5],
  ['ink-muted', 'surface-sunken', 4.5],
  ['ink-subtle', 'surface', 3],
  ['on-umber', 'umber', 4.5],
  ['on-umber-muted', 'umber', 4.5],
  ['on-umber', 'umber-soft', 4.5],
  ['on-ochre', 'ochre', 4.5],
  ['on-ochre', 'ochre-hover', 4.5],
  ['ochre-ink', 'surface', 4.5],
  ['ochre-ink', 'ground', 4.5],
  ['ochre-ink', 'ochre-soft', 4.5],
  ['on-danger', 'danger', 4.5],
  ['success', 'success-soft', 4.5],
  ['warning', 'warning-soft', 4.5],
  ['danger', 'danger-soft', 4.5],
  ['info', 'info-soft', 4.5],
  ['success', 'surface', 4.5],
  ['warning', 'surface', 4.5],
  ['danger', 'surface', 4.5],
  ['info', 'surface', 4.5],
  ['line-strong', 'surface', 3],
  ['focus-ring', 'surface', 3],
  ['focus-ring', 'ground', 3],
]

describe('design system Hoàng Thổ', () => {
  it('tokens.css được sinh từ tokens.json (chạy `pnpm tokens` nếu test này đỏ)', () => {
    const css = readFileSync(resolve(root, 'app/assets/css/tokens.css'), 'utf8')
    expect(css).toBe(renderTokensCss(tokens))
  })

  describe.each(['light', 'dark'] as const)('theme %s', (theme) => {
    it.each(PAIRS)('%s trên %s đạt tối thiểu %d:1', (fg, bg, min) => {
      expect(colors[fg], fg).toBeDefined()
      expect(colors[bg], bg).toBeDefined()
      expect(contrast(colors[fg]![theme], colors[bg]![theme])).toBeGreaterThanOrEqual(min)
    })
  })

  it('không dùng chữ trắng trên Hoàng Thổ (chỉ đạt khoảng 2.5:1)', () => {
    expect(contrast('#ffffff', colors.ochre!.light)).toBeLessThan(4.5)
  })
})
