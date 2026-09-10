import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { PollState } from '@/lib/types'

const mockGetPollState = vi.fn()
const mockSubmitPollVote = vi.fn()

vi.mock('@/lib/actions/polls', () => ({
  getPollState: (...args: unknown[]) => mockGetPollState(...args),
  submitPollVote: (...args: unknown[]) => mockSubmitPollVote(...args),
}))

const UNVOTED: PollState = {
  id: 'poll-1',
  question: 'Best RB this week?',
  options: ['Bijan Robinson', 'Breece Hall'],
  results: [0, 0],
  totalVotes: 0,
  votedOptionIndex: null,
}

const VOTED: PollState = {
  id: 'poll-1',
  question: 'Best RB this week?',
  options: ['Bijan Robinson', 'Breece Hall'],
  results: [3, 1],
  totalVotes: 4,
  votedOptionIndex: 0,
}

beforeEach(() => {
  mockGetPollState.mockReset()
  mockSubmitPollVote.mockReset()
})

describe('PollEmbed', () => {
  it('renders the question and clickable options once loaded', async () => {
    mockGetPollState.mockResolvedValue(UNVOTED)
    const { PollEmbed } = await import('@/components/landing/PollEmbed')
    render(<PollEmbed pollId="poll-1" />)

    expect(await screen.findByText('Best RB this week?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bijan Robinson' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Breece Hall' })).toBeInTheDocument()
  })

  it('submits a vote and renders result bars from the response', async () => {
    mockGetPollState.mockResolvedValue(UNVOTED)
    mockSubmitPollVote.mockResolvedValue(VOTED)
    const user = userEvent.setup()
    const { PollEmbed } = await import('@/components/landing/PollEmbed')
    render(<PollEmbed pollId="poll-1" />)

    await user.click(await screen.findByRole('button', { name: 'Bijan Robinson' }))

    expect(mockSubmitPollVote).toHaveBeenCalledWith('poll-1', 0)
    await waitFor(() => expect(screen.getByText('75%')).toBeInTheDocument())
    expect(screen.getByText('4 votes')).toBeInTheDocument()
  })

  it('renders results directly when the visitor has already voted', async () => {
    mockGetPollState.mockResolvedValue(VOTED)
    const { PollEmbed } = await import('@/components/landing/PollEmbed')
    render(<PollEmbed pollId="poll-1" />)

    expect(await screen.findByText('75%')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Bijan Robinson' })).not.toBeInTheDocument()
  })

  it('renders nothing when the poll cannot be found', async () => {
    mockGetPollState.mockResolvedValue(null)
    const { PollEmbed } = await import('@/components/landing/PollEmbed')
    const { container } = render(<PollEmbed pollId="missing" />)

    await waitFor(() => expect(mockGetPollState).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
  })
})
