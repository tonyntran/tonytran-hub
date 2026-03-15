import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { SkillMetadata } from '@/lib/types'

interface Props {
  metadata?: SkillMetadata
}

export function SkillFields({ metadata }: Props) {
  return (
    <>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input id="category" name="category" placeholder="Frontend" defaultValue={metadata?.category ?? ''} required />
      </div>
      <div>
        <Label htmlFor="level">Level (optional)</Label>
        <Input id="level" name="level" placeholder="Advanced" defaultValue={metadata?.level ?? ''} />
      </div>
    </>
  )
}
