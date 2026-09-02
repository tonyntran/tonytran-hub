import Link from 'next/link'
import type { ContentBlock, BlogPostMetadata } from '@/lib/types'
import { excerptFromMarkdown } from '@/lib/blogExcerpt'
import { AnimatedCard } from '@/components/landing/AnimatedCard'

interface Props {
  block: ContentBlock
  index?: number
}

export function BlogCard({ block, index = 0 }: Props) {
  const meta = block.metadata as BlogPostMetadata
  const excerpt = meta.excerpt ?? excerptFromMarkdown(block.body_md ?? '')
  const date = new Date(block.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <AnimatedCard delay={0.05 + index * 0.08}>
      <Link href={`/blog/${meta.slug}`} className="landing-card landing-blog-card">
        {meta.cover_image_url && (
          <div className="landing-blog-card-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={meta.cover_image_url} alt="" />
          </div>
        )}
        <p className="landing-blog-card-meta">{date}</p>
        <h2 className="landing-blog-card-title">{block.title ?? '(untitled)'}</h2>
        {excerpt && <p className="landing-blog-card-excerpt">{excerpt}</p>}
        <span className="landing-blog-card-cta">Read entry &rarr;</span>
      </Link>
    </AnimatedCard>
  )
}
