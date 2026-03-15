import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { HeroMetadata } from '@/lib/types'

interface Props {
  metadata?: HeroMetadata
}

export function HeroFields({ metadata }: Props) {
  return (
    <>
      <div>
        <Label htmlFor="tagline">Tagline</Label>
        <Input id="tagline" name="tagline" defaultValue={metadata?.tagline ?? ''} required />
      </div>
      <div>
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input id="subtitle" name="subtitle" defaultValue={metadata?.subtitle ?? ''} required />
      </div>
    </>
  )
}
