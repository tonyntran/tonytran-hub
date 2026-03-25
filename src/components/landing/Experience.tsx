import type { ContentBlock, ExperienceMetadata } from '@/lib/types'
import { AnimatedCard } from './AnimatedCard'

interface Props {
  blocks: ContentBlock[]
}

export function Experience({ blocks }: Props) {
  if (blocks.length === 0) return null

  return (
    <AnimatedCard className="landing-card landing-experience" id="experience" delay={0.1}>
      <div className="landing-card-label">Experience</div>
      <div className="landing-timeline">
        {blocks.map((block) => {
          const meta = block.metadata as ExperienceMetadata
          return (
            <div key={block.id} className="landing-timeline-entry">
              <div className="landing-timeline-role">{meta.role}</div>
              <div className="landing-timeline-meta">
                <span className="landing-timeline-company">{meta.company}</span>
                <span className="landing-timeline-period">
                  {meta.start_date} — {meta.end_date ?? 'Present'}
                </span>
              </div>
              {block.body_md && (
                <div className="landing-timeline-desc">{block.body_md}</div>
              )}
            </div>
          )
        })}
      </div>
    </AnimatedCard>
  )
}
