import { MapPin } from 'lucide-react'
import type { ContentBlock, AboutMetadata } from '@/lib/types'
import { AnimatedCard } from './AnimatedCard'
import { MarkdownContent } from './MarkdownContent'

interface Props {
  block: ContentBlock | undefined
}

export function About({ block }: Props) {
  if (!block) return null

  const meta = block.metadata as AboutMetadata

  return (
    <AnimatedCard className="landing-card landing-about" id="about" delay={0}>
      <div className="landing-card-label">About</div>
      <div className="landing-about-header">
        {meta.avatar_url && (
          <div className="landing-about-avatar">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={meta.avatar_url} alt="Avatar" />
          </div>
        )}
        <div>
          <div className="landing-card-title">{block.title ?? 'A bit about me'}</div>
          {meta.location && (
            <div className="landing-about-location">
              <MapPin size={13} />
              <span>{meta.location}</span>
            </div>
          )}
        </div>
      </div>
      {block.body_md && (
        <MarkdownContent className="landing-about-text">{block.body_md}</MarkdownContent>
      )}
    </AnimatedCard>
  )
}
