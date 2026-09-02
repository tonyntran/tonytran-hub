export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BlogCard } from '@/components/landing/blog/BlogCard'
import { ThemeToggle } from '@/components/landing/ThemeToggle'
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
    <div className="landing-theme">
      <header className="landing-blog-topbar">
        <Link href="/" className="landing-blog-wordmark">
          Tony Tran <span>/ Blog</span>
        </Link>
        <ThemeToggle />
      </header>
      <div className="landing-blog-container">
        <p className="landing-blog-eyebrow">Field Notes</p>
        <h1 className="landing-blog-title">Blog</h1>
        <div className="landing-blog-divider" />
        <p className="landing-blog-subtitle">
          Recaps, breakdowns, and the occasional rant — mostly fantasy football, sometimes everything else.
        </p>
        {posts.length === 0 ? (
          <p className="landing-blog-empty">No posts yet. Check back soon.</p>
        ) : (
          <div className="landing-blog-list">
            {posts.map((post, index) => (
              <BlogCard key={post.id} block={post} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
