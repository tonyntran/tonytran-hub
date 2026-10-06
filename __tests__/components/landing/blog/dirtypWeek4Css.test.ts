import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'

/**
 * jsdom does not do layout, so the breakout geometry cannot be asserted by rendering.
 * These tests guard the cascade invariants the centring depends on instead.
 *
 * The wide tables centre themselves with `margin-inline: calc(50% - breakout / 2)`,
 * where the 50% resolves against the parent. That only lands centred if the parent
 * (`.dirtyp-col`, including the `<details>` elements that carry the class) is itself
 * centred. A `margin` shorthand on `details` silently reset the inline margins to 0
 * and dragged all three "View as table" tables off the left edge of the screen.
 */
const css = readFileSync(
  join(process.cwd(), 'src/components/landing/blog/posts/dirtyp-week4.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '')

/** Return the declaration body of the first rule whose selector list matches exactly. */
function ruleBody(selector: string): string {
  const rules = css.matchAll(/([^{}]+)\{([^{}]*)\}/g)
  for (const [, sel, body] of rules) {
    if (sel.trim() === selector) return body
  }
  throw new Error(`rule not found: ${selector}`)
}

describe('dirtyp-week4 table breakout cascade', () => {
  it('centres the reading column with auto inline margins', () => {
    expect(ruleBody('.dirtyp-col')).toMatch(/margin-inline:\s*auto/)
  })

  it('does not let the details rule reset the inline margins of .dirtyp-col', () => {
    const body = ruleBody('.dirtyp-w4 details')
    // A `margin:` shorthand always sets all four sides and would beat
    // `.dirtyp-col { margin-inline: auto }` on specificity (0,1,1) vs (0,1,0).
    expect(body).not.toMatch(/(^|[;\s])margin\s*:/)
    expect(body).not.toMatch(/margin-(inline|left|right)/)
  })

  it('still spaces the details block vertically', () => {
    expect(ruleBody('.dirtyp-w4 details')).toMatch(/margin-block:/)
  })

  it('keeps every element that carries .dirtyp-col free of inline-margin overrides', () => {
    // Any rule more specific than `.dirtyp-col` that targets one of its carriers and
    // sets inline margins reintroduces the same off-centre bug.
    const offenders: string[] = []
    for (const [, selectorList, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const setsInline = /(^|[;\s])margin\s*:|margin-(inline|left|right)/.test(body)
      if (!setsInline) continue
      for (const sel of selectorList.split(',')) {
        const s = sel.trim()
        if (!s || s === '.dirtyp-col') continue
        // Only the subject of the selector (its last compound) is the element styled.
        const subject = s.split(/[\s>+~]+/).filter(Boolean).pop() ?? ''
        if (/^details$|\.dirtyp-col$/.test(subject)) offenders.push(s)
      }
    }
    expect(offenders).toEqual([])
  })
})
