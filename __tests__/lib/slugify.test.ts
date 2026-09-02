import { describe, it, expect } from 'vitest'
import { slugify } from '@/lib/slugify'

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('Week 4 Recap')).toBe('week-4-recap')
  })

  it('strips punctuation', () => {
    expect(slugify("Tony's Team, Beware!")).toBe('tonys-team-beware')
  })

  it('collapses repeated whitespace into a single hyphen', () => {
    expect(slugify('  Extra   Spaces  ')).toBe('extra-spaces')
  })

  it('trims leading and trailing hyphens', () => {
    expect(slugify('--Leading and Trailing--')).toBe('leading-and-trailing')
  })
})
