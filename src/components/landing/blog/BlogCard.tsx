import Link from 'next/link'
import type { ContentBlock, BlogPostMetadata } from '@/lib/types'
import { excerptFromMarkdown } from '@/lib/blogExcerpt'

interface Props {
  block: ContentBlock
}

export function BlogCard({ block }: Props) {
  const meta = block.metadata as BlogPostMetadata
  const excerpt = meta.excerpt ?? excerptFromMarkdown(block.body_md ?? '')
  const date = new Date(block.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Link
      href={`/blog/${meta.slug}`}
      className="block rounded-lg border p-6 transition-colors hover:bg-accent/5"
    >
      {meta.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={meta.cover_image_url}
          alt=""
          className="mb-4 aspect-video w-full rounded-md object-cover"
        />
      )}
      <p className="text-sm text-muted-foreground">{date}</p>
      <h2 className="mt-1 text-xl font-semibold">{block.title ?? '(untitled)'}</h2>
      {excerpt && <p className="mt-2 text-muted-foreground">{excerpt}</p>}
    </Link>
  )
}
