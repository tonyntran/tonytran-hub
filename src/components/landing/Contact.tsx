import type { ContentBlock, ContactMetadata } from '@/lib/types'

interface Props {
  blocks: ContentBlock[]
}

export function Contact({ blocks }: Props) {
  if (blocks.length === 0) return null

  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center" id="contact">
      <h2 className="mb-8 text-2xl font-bold">Get in Touch</h2>
      <div className="flex flex-wrap justify-center gap-6">
        {blocks.map((block) => {
          const meta = block.metadata as ContactMetadata
          return (
            <a
              key={block.id}
              href={meta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {meta.platform}: <span className="text-primary">{meta.display_text}</span>
            </a>
          )
        })}
      </div>
    </section>
  )
}
