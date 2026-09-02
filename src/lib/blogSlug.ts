import type { SupabaseClient } from '@supabase/supabase-js'

export async function isBlogSlugTaken(
  supabase: SupabaseClient,
  slug: string,
  excludeId?: string
): Promise<boolean> {
  let query = supabase
    .from('content_blocks')
    .select('id')
    .eq('type', 'blog_post')
    .eq('metadata->>slug', slug)

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data, error } = await query.maybeSingle()
  if (error) throw new Error(error.message)
  return !!data
}
