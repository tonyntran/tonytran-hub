import { describe, it, expect } from 'vitest'
import { getSkillIcon, getFallbackLabel } from '@/components/landing/skillIcons'

describe('getSkillIcon', () => {
  it('matches a known skill regardless of case', () => {
    expect(getSkillIcon('Python')).not.toBeNull()
    expect(getSkillIcon('PYTHON')).not.toBeNull()
  })

  it('trims surrounding whitespace before matching', () => {
    expect(getSkillIcon('  React  ')).not.toBeNull()
  })

  it('returns null for an unmapped skill', () => {
    expect(getSkillIcon('COBOL')).toBeNull()
  })

  it('returns the correct brand color for a known skill', () => {
    expect(getSkillIcon('TypeScript')?.color).toBe('#3178C6')
  })
})

describe('getFallbackLabel', () => {
  it('uses a single initial for a one-word title', () => {
    expect(getFallbackLabel('COBOL')).toBe('C')
  })

  it('disambiguates same-prefix titles with two-word initials', () => {
    expect(getFallbackLabel('AWS S3')).not.toBe(getFallbackLabel('AWS VPC'))
  })
})
