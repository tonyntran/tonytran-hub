import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BlogCard } from '@/components/landing/blog/BlogCard'
import type { ContentBlock } from '@/lib/types'

function makeBlogPost(overrides: Partial<ContentBlock> = {}): ContentBlock {
  return {
    id: '1',
    type: 'blog_post',
    title: 'Week 4 Recap',
    metadata: { slug: 'week-4-recap', excerpt: 'A wild week.', cover_image_url: null },
    body_md: 'Full recap body.',
    sort_order: 0,
    visible: true,
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('BlogCard', () => {
  it('renders the title, excerpt, and a link to the post slug', () => {
    render(<BlogCard block={makeBlogPost()} />)
    expect(screen.getByText('Week 4 Recap')).toBeInTheDocument()
    expect(screen.getByText('A wild week.')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/blog/week-4-recap')
  })

  it('falls back to a markdown-stripped excerpt when none is set', () => {
    render(
      <BlogCard
        block={makeBlogPost({
          metadata: { slug: 'week-5-recap', excerpt: null, cover_image_url: null },
          body_md: '# Week 5\n\nAnother **wild** week.',
        })}
      />
    )
    expect(screen.getByText('Week 5 Another wild week.')).toBeInTheDocument()
  })
})
