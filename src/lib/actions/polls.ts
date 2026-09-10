'use server'

import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import type { PollMetadata, PollState } from '@/lib/types'

const VOTER_ID_COOKIE = 'pv_id'
const VOTED_COOKIE_PREFIX = 'poll_voted_'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function votedCookieName(pollId: string) {
  return `${VOTED_COOKIE_PREFIX}${pollId}`
}

async function loadPoll(pollId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('content_blocks')
    .select('id, title, metadata')
    .eq('id', pollId)
    .eq('type', 'poll')
    .eq('visible', true)
    .maybeSingle()

  return data as { id: string; title: string | null; metadata: PollMetadata } | null
}

async function loadResults(pollId: string, optionCount: number) {
  const supabase = await createClient()
  const { data } = await supabase.from('poll_results').select('option_index, votes').eq('poll_id', pollId)

  const results = new Array(optionCount).fill(0)
  let totalVotes = 0
  for (const row of (data ?? []) as { option_index: number; votes: number }[]) {
    if (row.option_index >= 0 && row.option_index < optionCount) {
      results[row.option_index] = row.votes
      totalVotes += row.votes
    }
  }
  return { results, totalVotes }
}

export async function getPollState(pollId: string): Promise<PollState | null> {
  const poll = await loadPoll(pollId)
  if (!poll) return null

  const options = poll.metadata.options
  const cookieStore = await cookies()
  const voted = cookieStore.get(votedCookieName(pollId))?.value
  const votedOptionIndex = voted !== undefined ? Number(voted) : null

  if (votedOptionIndex === null) {
    return {
      id: poll.id,
      question: poll.title ?? '',
      options,
      results: new Array(options.length).fill(0),
      totalVotes: 0,
      votedOptionIndex: null,
    }
  }

  const { results, totalVotes } = await loadResults(pollId, options.length)
  return { id: poll.id, question: poll.title ?? '', options, results, totalVotes, votedOptionIndex }
}

export async function submitPollVote(
  pollId: string,
  optionIndex: number
): Promise<PollState | { error: string }> {
  const poll = await loadPoll(pollId)
  if (!poll) return { error: 'Poll not found' }

  const options = poll.metadata.options
  if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= options.length) {
    return { error: 'Invalid option' }
  }

  const cookieStore = await cookies()
  const cookieName = votedCookieName(pollId)
  const existingVote = cookieStore.get(cookieName)?.value

  let finalOptionIndex: number

  if (existingVote !== undefined) {
    finalOptionIndex = Number(existingVote)
  } else {
    let voterToken = cookieStore.get(VOTER_ID_COOKIE)?.value
    if (!voterToken) {
      voterToken = randomUUID()
      cookieStore.set(VOTER_ID_COOKIE, voterToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      })
    }

    const supabase = await createClient()
    const { error } = await supabase.from('poll_votes').insert({
      poll_id: pollId,
      option_index: optionIndex,
      voter_token: voterToken,
    })

    // 23505 = unique_violation: this browser already voted, treat as success
    if (error && (error as { code?: string }).code !== '23505') {
      return { error: 'Could not record vote' }
    }

    finalOptionIndex = optionIndex
    cookieStore.set(cookieName, String(finalOptionIndex), {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    })
  }

  const { results, totalVotes } = await loadResults(pollId, options.length)
  return { id: poll.id, question: poll.title ?? '', options, results, totalVotes, votedOptionIndex: finalOptionIndex }
}
