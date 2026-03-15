import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ContentBlock, AboutMetadata } from '@/lib/types'

interface Props {
  block: ContentBlock | undefined
}

export function About({ block }: Props) {
  if (!block) return null
  const { avatar_url, location } = block.metadata as AboutMetadata

  return (
    <section className="mx-auto max-w-3xl px-6 py-24" id="about">
      <div className="flex gap-6">
        {avatar_url && (
          <img
            src={avatar_url}
            alt="Avatar"
            className="h-20 w-20 rounded-full object-cover"
          />
        )}
        <div>
          <h2 className="text-2xl font-bold">{block.title ?? 'About'}</h2>
          {location && (
            <p className="mt-1 text-sm text-muted-foreground">{location}</p>
          )}
          {block.body_md && (
            <div className="prose prose-sm dark:prose-invert mt-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.body_md}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
