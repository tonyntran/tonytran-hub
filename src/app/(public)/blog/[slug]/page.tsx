export const dynamic = 'force-dynamic'

import { cache } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { MarkdownContent } from '@/components/landing/MarkdownContent'
import { ThemeToggle } from '@/components/landing/ThemeToggle'
import { excerptFromMarkdown } from '@/lib/blogExcerpt'
import type { ContentBlock, BlogPostMetadata } from '@/lib/types'

interface Props {
  params: Promise<{ slug: string }>
}

const getPost = cache(async (slug: string): Promise<ContentBlock | null> => {
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
    return data as ContentBlock | null
  } catch {
    return null
  }
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}

  const meta = post.metadata as BlogPostMetadata
  const title = post.title ?? '(untitled)'
  const description = meta.excerpt ?? excerptFromMarkdown(post.body_md ?? '')

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      ...(meta.cover_image_url ? { images: [meta.cover_image_url] } : {}),
    },
    twitter: {
      card: meta.cover_image_url ? 'summary_large_image' : 'summary',
      title,
      description,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) notFound()

  const meta = post.metadata as BlogPostMetadata
  const date = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="landing-theme">
      <header className="landing-blog-topbar">
        <Link href="/" className="landing-blog-wordmark">
          Tony Tran <span>/ Blog</span>
        </Link>
        <ThemeToggle />
      </header>
      <article className="landing-blog-container">
        <Link href="/blog" className="landing-blog-back">
          &larr; Back to blog
        </Link>
        <p className="landing-blog-article-meta">{date}</p>
        <h1 className="landing-blog-title">{post.title ?? '(untitled)'}</h1>
        <div className="landing-blog-divider" />
        {meta.cover_image_url && (
          <div className="landing-blog-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={meta.cover_image_url} alt="" />
          </div>
        )}
        <MarkdownContent className="landing-blog-article">{post.body_md ?? ''}</MarkdownContent>
      </article>
    </div>
  )
}
