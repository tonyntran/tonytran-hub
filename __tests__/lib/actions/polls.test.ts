import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPollState, submitPollVote } from '@/lib/actions/polls'

const { mockCookies, mockCreateClient } = vi.hoisted(() => ({
  mockCookies: vi.fn(),
  mockCreateClient: vi.fn(),
}))

vi.mock('next/headers', () => ({ cookies: mockCookies }))
vi.mock('@/lib/supabase/server', () => ({ createClient: mockCreateClient }))

interface FakeSupabaseOptions {
  blockRow?: { id: string; title: string | null; metadata: { options: string[] } } | null
  resultsRows?: { option_index: number; votes: number }[]
  insertError?: { code: string } | null
}

function makeFakeCookieJar(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial))
  const sets: { name: string; value: string; options: unknown }[] = []
  return {
    jar: {
      get: (name: string) => (store.has(name) ? { name, value: store.get(name)! } : undefined),
      set: (name: string, value: string, options?: unknown) => {
        store.set(name, value)
        sets.push({ name, value, options })
      },
    },
    sets,
  }
}

function makeFakeSupabase({ blockRow = null, resultsRows = [], insertError = null }: FakeSupabaseOptions) {
  const insertCalls: unknown[] = []
  return {
    from: (table: string) => {
      if (table === 'content_blocks') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: () => Promise.resolve({ data: blockRow, error: null }),
                }),
              }),
            }),
          }),
        }
      }
      if (table === 'poll_results') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: resultsRows, error: null }),
          }),
        }
      }
      if (table === 'poll_votes') {
        return {
          insert: (row: unknown) => {
            insertCalls.push(row)
            return Promise.resolve({ error: insertError })
          },
        }
      }
      throw new Error(`Unexpected table: ${table}`)
    },
    insertCalls,
  }
}

const POLL: FakeSupabaseOptions['blockRow'] = {
  id: 'poll-1',
  title: 'Best RB this week?',
  metadata: { options: ['Bijan Robinson', 'Breece Hall'] },
}

beforeEach(() => {
  mockCookies.mockReset()
  mockCreateClient.mockReset()
})

describe('getPollState', () => {
  it('returns null when the poll does not exist', async () => {
    const { jar } = makeFakeCookieJar()
    mockCookies.mockResolvedValue(jar)
    mockCreateClient.mockResolvedValue(makeFakeSupabase({ blockRow: null }))

    expect(await getPollState('missing')).toBeNull()
  })

  it('returns zeroed results and null votedOptionIndex when the visitor has not voted', async () => {
    const { jar } = makeFakeCookieJar()
    mockCookies.mockResolvedValue(jar)
    mockCreateClient.mockResolvedValue(
      makeFakeSupabase({ blockRow: POLL, resultsRows: [{ option_index: 0, votes: 5 }] })
    )

    const state = await getPollState('poll-1')
    expect(state).toEqual({
      id: 'poll-1',
      question: 'Best RB this week?',
      options: ['Bijan Robinson', 'Breece Hall'],
      results: [0, 0],
      totalVotes: 0,
      votedOptionIndex: null,
    })
  })

  it('returns live tallies when the voted cookie is present', async () => {
    const { jar } = makeFakeCookieJar({ poll_voted_poll_1: '1' })
    mockCookies.mockResolvedValue(jar)
    mockCreateClient.mockResolvedValue(
      makeFakeSupabase({
        blockRow: POLL,
        resultsRows: [
          { option_index: 0, votes: 3 },
          { option_index: 1, votes: 7 },
        ],
      })
    )

    const state = await getPollState('poll_1')
    expect(state).toMatchObject({ results: [3, 7], totalVotes: 10, votedOptionIndex: 1 })
  })
})

describe('submitPollVote', () => {
  it('rejects an out-of-range option index', async () => {
    const { jar } = makeFakeCookieJar()
    mockCookies.mockResolvedValue(jar)
    mockCreateClient.mockResolvedValue(makeFakeSupabase({ blockRow: POLL }))

    const result = await submitPollVote('poll-1', 5)
    expect(result).toEqual({ error: 'Invalid option' })
  })

  it('inserts a vote, sets the voted cookie, and returns updated results', async () => {
    const { jar, sets } = makeFakeCookieJar()
    mockCookies.mockResolvedValue(jar)
    const supabase = makeFakeSupabase({
      blockRow: POLL,
      resultsRows: [{ option_index: 0, votes: 1 }],
    })
    mockCreateClient.mockResolvedValue(supabase)

    const result = await submitPollVote('poll-1', 0)

    expect(supabase.insertCalls).toEqual([
      expect.objectContaining({ poll_id: 'poll-1', option_index: 0 }),
    ])
    expect(sets.some((s) => s.name === 'poll_voted_poll-1' && s.value === '0')).toBe(true)
    expect(result).toMatchObject({ votedOptionIndex: 0, results: [1, 0] })
  })

  it('does not insert twice and returns the original choice when the voted cookie already exists', async () => {
    const { jar } = makeFakeCookieJar({ 'poll_voted_poll-1': '1' })
    mockCookies.mockResolvedValue(jar)
    const supabase = makeFakeSupabase({
      blockRow: POLL,
      resultsRows: [
        { option_index: 0, votes: 2 },
        { option_index: 1, votes: 4 },
      ],
    })
    mockCreateClient.mockResolvedValue(supabase)

    // client re-clicks a different option after already voting for option 1
    const result = await submitPollVote('poll-1', 0)

    expect(supabase.insertCalls).toEqual([])
    expect(result).toMatchObject({ votedOptionIndex: 1, results: [2, 4] })
  })

  it('treats a duplicate-vote database error as success instead of failing', async () => {
    const { jar } = makeFakeCookieJar()
    mockCookies.mockResolvedValue(jar)
    const supabase = makeFakeSupabase({
      blockRow: POLL,
      resultsRows: [{ option_index: 0, votes: 1 }],
      insertError: { code: '23505' },
    })
    mockCreateClient.mockResolvedValue(supabase)

    const result = await submitPollVote('poll-1', 0)
    expect(result).toMatchObject({ votedOptionIndex: 0 })
  })
})
