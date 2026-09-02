import { describe, it, expect } from 'vitest'
import { excerptFromMarkdown } from '@/lib/blogExcerpt'

describe('excerptFromMarkdown', () => {
  it('returns plain text unchanged', () => {
    expect(excerptFromMarkdown('Just plain text.')).toBe('Just plain text.')
  })

  it('strips headings, bold syntax, and resolves links to their text', () => {
    const input = '# Week 4\n\nWe had a **wild** week with [this trade](https://example.com).'
    expect(excerptFromMarkdown(input)).toBe('Week 4 We had a wild week with this trade.')
  })

  it('truncates long text and appends an ellipsis', () => {
    const long = 'a'.repeat(200)
    const result = excerptFromMarkdown(long)
    expect(result.length).toBe(161)
    expect(result.endsWith('…')).toBe(true)
  })
})
