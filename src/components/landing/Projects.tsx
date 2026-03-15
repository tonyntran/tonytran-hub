import type { ContentBlock, ProjectMetadata } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  blocks: ContentBlock[]
}

export function Projects({ blocks }: Props) {
  // Only show featured projects on landing page
  const featured = blocks.filter((b) => (b.metadata as ProjectMetadata).is_featured)
  if (featured.length === 0) return null

  return (
    <section className="mx-auto max-w-4xl px-6 py-24" id="projects">
      <h2 className="mb-8 text-2xl font-bold">Featured Projects</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((block) => {
          const meta = block.metadata as ProjectMetadata
          return (
            <Card key={block.id} className="overflow-hidden">
              {meta.image_url && (
                <img
                  src={meta.image_url}
                  alt={block.title ?? 'Project'}
                  className="h-40 w-full object-cover"
                />
              )}
              <CardContent className="p-4">
                <h3 className="font-semibold">{block.title}</h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  {meta.tech_stack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
                {(meta.url || meta.github_url) && (
                  <div className="mt-3 flex gap-3 text-sm">
                    {meta.url && (
                      <a href={meta.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Live →
                      </a>
                    )}
                    {meta.github_url && (
                      <a href={meta.github_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        GitHub →
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
