import type { ContentBlock, SkillMetadata } from '@/lib/types'

interface Props {
  blocks: ContentBlock[]
}

export function Skills({ blocks }: Props) {
  if (blocks.length === 0) return null

  // Group by category
  const grouped = blocks.reduce<Record<string, ContentBlock[]>>((acc, block) => {
    const category = (block.metadata as SkillMetadata).category
    if (!acc[category]) acc[category] = []
    acc[category].push(block)
    return acc
  }, {})

  return (
    <section className="mx-auto max-w-3xl px-6 py-24" id="skills">
      <h2 className="mb-8 text-2xl font-bold">Skills</h2>
      <div className="space-y-6">
        {Object.entries(grouped).map(([category, skills]) => (
          <div key={category}>
            <p className="mb-2 text-xs uppercase text-muted-foreground">{category}</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className="rounded-full bg-secondary px-3 py-1 text-sm"
                >
                  {skill.title}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
