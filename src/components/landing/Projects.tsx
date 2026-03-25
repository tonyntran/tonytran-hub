import type { ContentBlock, ProjectMetadata } from '@/lib/types'
import { MediaCard } from './MediaCard'

interface Props {
  blocks: ContentBlock[]
}

export function Projects({ blocks }: Props) {
  const featured = blocks.filter((b) => (b.metadata as ProjectMetadata).is_featured)
  if (featured.length === 0) return null

  return (
    <>
      {featured.map((block, i) => (
        <MediaCard
          key={block.id}
          block={block}
          className={`landing-media-${i + 1}`}
          hasVideo={i === 1}
          index={i}
        />
      ))}
    </>
  )
}
