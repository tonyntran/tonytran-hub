import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MarkdownContent } from '@/components/landing/MarkdownContent'

vi.mock('@/components/landing/PollEmbed', () => ({
  PollEmbed: ({ pollId }: { pollId: string }) => <div data-testid="poll-embed">{pollId}</div>,
}))

describe('MarkdownContent', () => {
  it('renders a poll fenced code block as a PollEmbed with the trimmed id', () => {
    render(<MarkdownContent>{'```poll\n3f9a1c2e-1234-4a3b-9abc-1234567890ab\n```'}</MarkdownContent>)
    const embed = screen.getByTestId('poll-embed')
    expect(embed).toHaveTextContent('3f9a1c2e-1234-4a3b-9abc-1234567890ab')
  })

  it('still renders an ordinary fenced code block as code, not a poll embed', () => {
    render(<MarkdownContent>{'```js\nconsole.log(1)\n```'}</MarkdownContent>)
    expect(screen.queryByTestId('poll-embed')).not.toBeInTheDocument()
    expect(screen.getByText('console.log(1)')).toBeInTheDocument()
  })

  it('renders plain markdown text unaffected', () => {
    render(<MarkdownContent>{'Hello **world**'}</MarkdownContent>)
    expect(screen.getByText('world')).toBeInTheDocument()
  })
})
