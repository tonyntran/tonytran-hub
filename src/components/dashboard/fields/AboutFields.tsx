import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AboutMetadata } from '@/lib/types'

interface Props {
  metadata?: AboutMetadata
}

export function AboutFields({ metadata }: Props) {
  return (
    <>
      <div>
        <Label htmlFor="avatar_url">Avatar URL</Label>
        <Input id="avatar_url" name="avatar_url" type="url" defaultValue={metadata?.avatar_url ?? ''} required />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" defaultValue={metadata?.location ?? ''} required />
      </div>
    </>
  )
}
