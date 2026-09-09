import type { ContentBlock, SkillMetadata } from '@/lib/types'
import { AnimatedCard } from './AnimatedCard'
import { getSkillIcon, getFallbackLabel } from './skillIcons'

interface Props {
  blocks: ContentBlock[]
}

export function Skills({ blocks }: Props) {
  if (blocks.length === 0) return null

  const grouped = blocks.reduce<Record<string, ContentBlock[]>>((acc, block) => {
    const category = (block.metadata as SkillMetadata).category
    if (!acc[category]) acc[category] = []
    acc[category].push(block)
    return acc
  }, {})

  return (
    <AnimatedCard className="landing-card landing-skills" id="skills" delay={0.15}>
      <div className="landing-card-label">Skills</div>
      <div className="landing-card-title">Tech Stack</div>
      {Object.entries(grouped).map(([category, skills]) => (
        <div key={category} className="landing-skill-category-group">
          <div className="landing-skill-category-row">
            <span className="landing-skill-category">{category}</span>
            <span className="landing-skill-category-line" />
          </div>
          <div className="landing-skills-grid">
            {skills.map((skill) => {
              const icon = getSkillIcon(skill.title ?? '')
              return (
                <div key={skill.id} className="landing-skill-tile">
                  <span className="landing-skill-tile-icon">
                    {icon ? (
                      <icon.Icon size={26} color={icon.color} />
                    ) : (
                      <span className="landing-skill-tile-fallback">
                        {getFallbackLabel(skill.title ?? '?')}
                      </span>
                    )}
                  </span>
                  <span className="landing-skill-tile-label">{skill.title}</span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </AnimatedCard>
  )
}
