import type { ContentBlock } from '@/lib/types'

interface Props {
  block: ContentBlock | undefined
}

export function About({ block }: Props) {
  if (!block) return null

  return (
    <div className="landing-card landing-about" id="about">
      <div className="landing-card-label">About</div>
      <div className="landing-card-title">{block.title ?? 'A bit about me'}</div>
      {block.body_md && (
        <div className="landing-about-text">{block.body_md}</div>
      )}
    </div>
  )
}
