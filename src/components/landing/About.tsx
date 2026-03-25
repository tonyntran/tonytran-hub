import type { ContentBlock } from '@/lib/types'
import { AnimatedCard } from './AnimatedCard'

interface Props {
  block: ContentBlock | undefined
}

export function About({ block }: Props) {
  if (!block) return null

  return (
    <AnimatedCard className="landing-card landing-about" id="about" delay={0}>
      <div className="landing-card-label">About</div>
      <div className="landing-card-title">{block.title ?? 'A bit about me'}</div>
      {block.body_md && (
        <div className="landing-about-text">{block.body_md}</div>
      )}
    </AnimatedCard>
  )
}
