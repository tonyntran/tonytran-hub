export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { BlogCard } from '@/components/landing/blog/BlogCard'
import type { ContentBlock } from '@/lib/types'

export default async function BlogListPage() {
  let posts: ContentBlock[] = []

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('type', 'blog_post')
      .eq('visible', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    posts = (data as ContentBlock[]) ?? []
  } catch {
    posts = []
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <a href="/" className="text-sm text-muted-foreground hover:underline">
        ← Back home
      </a>
      <h1 className="mt-4 mb-8 text-3xl font-bold">Blog</h1>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts yet.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {posts.map((post) => (
            <BlogCard key={post.id} block={post} />
          ))}
        </div>
      )}
    </div>
  )
}
