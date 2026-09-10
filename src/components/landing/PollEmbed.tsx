'use client'

import { useEffect, useState, useTransition } from 'react'
import { getPollState, submitPollVote } from '@/lib/actions/polls'
import type { PollState } from '@/lib/types'

interface Props {
  pollId: string
}

export function PollEmbed({ pollId }: Props) {
  const [state, setState] = useState<PollState | null | 'loading'>('loading')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    let cancelled = false
    getPollState(pollId).then((result) => {
      if (!cancelled) setState(result)
    })
    return () => {
      cancelled = true
    }
  }, [pollId])

  if (state === 'loading') {
    return <div className="landing-poll landing-poll-loading" aria-hidden="true" />
  }

  if (state === null) {
    return null
  }

  const handleVote = (optionIndex: number) => {
    startTransition(async () => {
      const result = await submitPollVote(pollId, optionIndex)
      if (!('error' in result)) {
        setState(result)
      }
    })
  }

  const hasVoted = state.votedOptionIndex !== null

  return (
    <div className="landing-poll">
      <div className="landing-poll-question">{state.question}</div>
      <div className="landing-poll-options">
        {state.options.map((option, i) => {
          if (!hasVoted) {
            return (
              <button
                key={option}
                type="button"
                className="landing-poll-option"
                onClick={() => handleVote(i)}
                disabled={isPending}
              >
                {option}
              </button>
            )
          }

          const votes = state.results[i] ?? 0
          const percent = state.totalVotes > 0 ? Math.round((votes / state.totalVotes) * 100) : 0
          const isSelected = i === state.votedOptionIndex

          return (
            <div key={option} className={`landing-poll-result${isSelected ? ' selected' : ''}`}>
              <div className="landing-poll-result-row">
                <span className="landing-poll-result-label">{option}</span>
                <span className="landing-poll-result-percent">{percent}%</span>
              </div>
              <div className="landing-poll-bar-track">
                <div className="landing-poll-bar-fill" style={{ width: `${percent}%` }} />
              </div>
            </div>
          )
        })}
      </div>
      {hasVoted && (
        <div className="landing-poll-meta">
          {state.totalVotes} {state.totalVotes === 1 ? 'vote' : 'votes'}
        </div>
      )}
    </div>
  )
}
