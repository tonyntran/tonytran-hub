import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { PollMetadata } from '@/lib/types'

interface Props {
  metadata?: PollMetadata
}

export function PollFields({ metadata }: Props) {
  return (
    <div>
      <Label htmlFor="options">Options (one per line, 2-8)</Label>
      <Textarea
        id="options"
        name="options"
        rows={4}
        defaultValue={metadata?.options?.join('\n') ?? ''}
        placeholder={'Bijan Robinson\nChristian McCaffrey\nBreece Hall'}
      />
    </div>
  )
}
