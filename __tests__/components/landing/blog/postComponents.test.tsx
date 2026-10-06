import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CustomPostBody } from '@/components/landing/blog/posts/CustomPostBody'
import {
  CUSTOM_POST_KEYS,
  hasCustomPostBody,
} from '@/components/landing/blog/posts/registry'

describe('hasCustomPostBody', () => {
  it('is false when no component key is set', () => {
    expect(hasCustomPostBody(null)).toBe(false)
    expect(hasCustomPostBody(undefined)).toBe(false)
    expect(hasCustomPostBody('')).toBe(false)
  })

  it('is false for an unregistered key so the post falls back to markdown', () => {
    expect(hasCustomPostBody('not-a-real-post')).toBe(false)
  })

  it('is true for every registered key', () => {
    expect(CUSTOM_POST_KEYS.length).toBeGreaterThan(0)
    for (const key of CUSTOM_POST_KEYS) {
      expect(hasCustomPostBody(key)).toBe(true)
    }
  })

  it('registers the Dirty P Week 4 column', () => {
    expect(CUSTOM_POST_KEYS).toContain('dirty-p-week-4')
  })
})

describe('CustomPostBody', () => {
  it('renders nothing for an absent or unknown key', () => {
    const { container: empty } = render(<CustomPostBody componentKey={null} />)
    expect(empty).toBeEmptyDOMElement()

    const { container: unknown } = render(<CustomPostBody componentKey="nope" />)
    expect(unknown).toBeEmptyDOMElement()
  })
})

describe('DirtyPWeek4 column', () => {
  const renderColumn = () => render(<CustomPostBody componentKey="dirty-p-week-4" />)

  it('renders the headline', () => {
    renderColumn()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /The Standings\s*Are\s*Lying\s*To You/i,
    )
  })

  it('scopes all of its styles under a single root class', () => {
    const { container } = renderColumn()
    expect(container.querySelector('.dirtyp-w4')).toBeInTheDocument()
  })

  it('renders the all-play dumbbell row for every team', () => {
    const { container } = renderColumn()
    expect(container.querySelectorAll('.dirtyp-db-row')).toHaveLength(10)
  })

  it('renders a bench-points bar for every team', () => {
    const { container } = renderColumn()
    expect(container.querySelectorAll('.dirtyp-bar-row')).toHaveLength(10)
  })

  it('renders ten power-ranking entries, each with a sparkline', () => {
    const { container } = renderColumn()
    expect(container.querySelectorAll('.dirtyp-rk')).toHaveLength(10)
    expect(container.querySelectorAll('.dirtyp-rk svg')).toHaveLength(10)
  })

  it('ranks Austin Clout Demons first after the trajectory correction', () => {
    const { container } = renderColumn()
    expect(container.querySelector('.dirtyp-rk .dirtyp-rk-name')).toHaveTextContent(
      'Austin Clout Demons',
    )
  })

  it('renders all five game capsules', () => {
    const { container } = renderColumn()
    expect(container.querySelectorAll('.dirtyp-cap')).toHaveLength(5)
  })

  it('exposes a data table alongside each chart for accessibility', () => {
    const { container } = renderColumn()
    // fraud gap, bench report, power-ranking breakdown
    expect(container.querySelectorAll('details table').length).toBeGreaterThanOrEqual(3)
  })

  it('marks the author team so it reads differently from the rest', () => {
    const { container } = renderColumn()
    expect(container.querySelectorAll('.dirtyp-me').length).toBeGreaterThan(0)
  })
})
