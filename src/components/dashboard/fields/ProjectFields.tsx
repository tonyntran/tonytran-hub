import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ProjectMetadata } from '@/lib/types'

interface Props {
  metadata?: ProjectMetadata
}

export function ProjectFields({ metadata }: Props) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="url">Live URL (optional)</Label>
          <Input id="url" name="url" type="url" defaultValue={metadata?.url ?? ''} />
        </div>
        <div>
          <Label htmlFor="github_url">GitHub URL (optional)</Label>
          <Input id="github_url" name="github_url" type="url" defaultValue={metadata?.github_url ?? ''} />
        </div>
      </div>
      <div>
        <Label htmlFor="tech_stack">Tech Stack (comma-separated)</Label>
        <Input id="tech_stack" name="tech_stack" placeholder="React, Node.js, PostgreSQL" defaultValue={metadata?.tech_stack?.join(', ') ?? ''} />
      </div>
      <div>
        <Label htmlFor="image_url">Image URL (optional)</Label>
        <Input id="image_url" name="image_url" type="url" defaultValue={metadata?.image_url ?? ''} />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="is_featured" name="is_featured" defaultChecked={metadata?.is_featured ?? false} className="rounded border" />
        <Label htmlFor="is_featured" className="text-sm font-normal">Featured on landing page</Label>
      </div>
    </>
  )
}
