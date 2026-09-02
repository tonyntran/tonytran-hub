import { describe, it, expect } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { isBlogSlugTaken } from '@/lib/blogSlug'

function makeFakeSupabase(result: { data: unknown }) {
  const calls: { method: string; args: unknown[] }[] = []
  const builder = {
    select: (...args: unknown[]) => {
      calls.push({ method: 'select', args })
      return builder
    },
    eq: (...args: unknown[]) => {
      calls.push({ method: 'eq', args })
      return builder
    },
    neq: (...args: unknown[]) => {
      calls.push({ method: 'neq', args })
      return builder
    },
    maybeSingle: () => Promise.resolve({ ...result, error: null }),
  }
  const supabase = { from: () => builder } as unknown as SupabaseClient
  return { supabase, calls }
}

describe('isBlogSlugTaken', () => {
  it('returns true when a matching row exists', async () => {
    const { supabase, calls } = makeFakeSupabase({ data: { id: 'existing' } })
    expect(await isBlogSlugTaken(supabase, 'week-4-recap')).toBe(true)
    expect(calls).toContainEqual({ method: 'eq', args: ['type', 'blog_post'] })
    expect(calls).toContainEqual({ method: 'eq', args: ['metadata->>slug', 'week-4-recap'] })
  })

  it('returns false when no row matches', async () => {
    const { supabase, calls } = makeFakeSupabase({ data: null })
    expect(await isBlogSlugTaken(supabase, 'week-4-recap')).toBe(false)
    expect(calls).toContainEqual({ method: 'eq', args: ['type', 'blog_post'] })
    expect(calls).toContainEqual({ method: 'eq', args: ['metadata->>slug', 'week-4-recap'] })
  })

  it('excludes the given id from the check', async () => {
    const { supabase, calls } = makeFakeSupabase({ data: null })
    await isBlogSlugTaken(supabase, 'week-4-recap', 'post-1')
    expect(calls).toContainEqual({ method: 'neq', args: ['id', 'post-1'] })
  })
})
