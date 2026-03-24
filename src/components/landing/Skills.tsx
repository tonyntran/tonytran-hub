import type { ContentBlock, SkillMetadata } from '@/lib/types'

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
    <div className="landing-card landing-skills" id="skills">
      <div className="landing-card-label">Skills</div>
      {Object.entries(grouped).map(([category, skills]) => (
        <div key={category}>
          <div className="landing-skill-category">{category}</div>
          <div className="landing-skills-grid">
            {skills.map((skill) => (
              <span key={skill.id} className="landing-skill-tag">
                {skill.title}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
