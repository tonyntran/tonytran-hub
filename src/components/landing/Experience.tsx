import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ContentBlock, ExperienceMetadata } from '@/lib/types'

interface Props {
  blocks: ContentBlock[]
}

export function Experience({ blocks }: Props) {
  if (blocks.length === 0) return null

  return (
    <section className="mx-auto max-w-3xl px-6 py-24" id="experience">
      <h2 className="mb-8 text-2xl font-bold">Experience</h2>
      <div className="border-l-2 border-primary/30 pl-6 space-y-8">
        {blocks.map((block) => {
          const meta = block.metadata as ExperienceMetadata
          return (
            <div key={block.id}>
              <div className="flex items-baseline justify-between">
                <h3 className="font-semibold">{meta.role}</h3>
                <span className="text-xs text-muted-foreground">
                  {meta.start_date} — {meta.end_date ?? 'Present'}
                </span>
              </div>
              <p className="text-sm text-primary">{meta.company}</p>
              {block.body_md && (
                <div className="prose prose-sm dark:prose-invert mt-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.body_md}</ReactMarkdown>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
