import type { ContentBlock, ExperienceMetadata } from '@/lib/types'

interface Props {
  blocks: ContentBlock[]
}

export function Experience({ blocks }: Props) {
  if (blocks.length === 0) return null

  return (
    <div className="landing-card landing-experience" id="experience">
      <div className="landing-card-label">Experience</div>
      <div className="landing-timeline">
        {blocks.map((block) => {
          const meta = block.metadata as ExperienceMetadata
          return (
            <div key={block.id} className="landing-timeline-entry">
              <div className="landing-timeline-role">{meta.role}</div>
              <div className="landing-timeline-company">{meta.company}</div>
              <div className="landing-timeline-period">
                {meta.start_date} — {meta.end_date ?? 'Present'}
              </div>
              {block.body_md && (
                <div className="landing-timeline-desc">{block.body_md}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
