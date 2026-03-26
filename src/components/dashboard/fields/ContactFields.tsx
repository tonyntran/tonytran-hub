import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ContactMetadata } from '@/lib/types'

interface Props {
  metadata?: ContactMetadata
}

export function ContactFields({ metadata }: Props) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="platform">Platform</Label>
          <Input id="platform" name="platform" placeholder="GitHub" defaultValue={metadata?.platform ?? ''} required />
        </div>
        <div>
          <Label htmlFor="display_text">Display Text</Label>
          <Input id="display_text" name="display_text" placeholder="@tonyntran" defaultValue={metadata?.display_text ?? ''} required />
        </div>
      </div>
      <div>
        <Label htmlFor="contact_url">URL</Label>
        <Input id="contact_url" name="contact_url" type="url" defaultValue={metadata?.url ?? ''} required />
      </div>
      <div>
        <Label htmlFor="icon">Icon</Label>
        <Input id="icon" name="icon" placeholder="github" defaultValue={metadata?.icon ?? ''} required />
        <p className="mt-1 text-xs text-muted-foreground">
          Available: github, linkedin, twitter, x, email, instagram, youtube, facebook, globe
        </p>
      </div>
    </>
  )
}
