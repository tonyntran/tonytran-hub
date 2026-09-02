export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MarkdownContent } from '@/components/landing/MarkdownContent'
import type { ContentBlock, BlogPostMetadata } from '@/lib/types'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  let post: ContentBlock | null = null

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('type', 'blog_post')
      .eq('visible', true)
      .eq('metadata->>slug', slug)
      .maybeSingle()

    if (error) throw error
    post = data as ContentBlock | null
  } catch {
    notFound()
  }

  if (!post) notFound()

  const meta = post.metadata as BlogPostMetadata
  const date = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <a href="/blog" className="text-sm text-muted-foreground hover:underline">
        ← Back to blog
      </a>
      {meta.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={meta.cover_image_url}
          alt=""
          className="my-6 aspect-video w-full rounded-md object-cover"
        />
      )}
      <p className="mt-4 text-sm text-muted-foreground">{date}</p>
      <h1 className="mt-1 text-3xl font-bold">{post.title ?? '(untitled)'}</h1>
      <MarkdownContent className="mt-6">{post.body_md ?? ''}</MarkdownContent>
    </article>
  )
}
