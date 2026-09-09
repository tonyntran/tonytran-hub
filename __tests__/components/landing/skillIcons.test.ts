import { describe, it, expect } from 'vitest'
import { getSkillIcon } from '@/components/landing/skillIcons'

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
