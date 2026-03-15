'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { MarkdownEditor } from './MarkdownEditor'
import { HeroFields } from './fields/HeroFields'
import { AboutFields } from './fields/AboutFields'
import { ExperienceFields } from './fields/ExperienceFields'
import { SkillFields } from './fields/SkillFields'
import { ProjectFields } from './fields/ProjectFields'
import { ContactFields } from './fields/ContactFields'
import { createContentBlock, updateContentBlock } from '@/lib/actions/content'
import { ALL_CONTENT_TYPES, type ContentBlock, type ContentBlockType } from '@/lib/types'

interface Props {
  block?: ContentBlock
  defaultType?: ContentBlockType
  singletonStatus?: Record<string, boolean>
}

export function ContentForm({ block, defaultType, singletonStatus }: Props) {
  const router = useRouter()
  const isEditing = !!block
  const [type, setType] = useState<ContentBlockType>(block?.type ?? defaultType ?? 'experience')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const result = isEditing
      ? await updateContentBlock(block.id, type, formData)
      : await createContentBlock(type, formData)

    setLoading(false)

    if (result.error) {
      const errors = result.error
      if ('server' in errors) {
        toast.error((errors as { server: string[] }).server[0])
      } else {
        toast.error('Please fix the validation errors')
      }
      return
    }

    toast.success(isEditing ? 'Content updated' : 'Content created')
    router.push('/dashboard/content')
  }

  const renderFields = () => {
    const metadata = block?.metadata as Record<string, unknown> | undefined
    switch (type) {
      case 'hero':
        return <HeroFields metadata={metadata as any} />
      case 'about':
        return <AboutFields metadata={metadata as any} />
      case 'experience':
        return <ExperienceFields metadata={metadata as any} />
      case 'skill':
        return <SkillFields metadata={metadata as any} />
      case 'project':
        return <ProjectFields metadata={metadata as any} />
      case 'contact':
        return <ContactFields metadata={metadata as any} />
    }
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        await handleSubmit(new FormData(e.currentTarget))
      }}
      className="max-w-2xl space-y-6"
    >
      <div>
        <Label>Type</Label>
        {isEditing ? (
          <p className="text-sm font-medium capitalize text-muted-foreground">{type}</p>
        ) : (
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ContentBlockType)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            {ALL_CONTENT_TYPES.map((t) => {
              const exists = singletonStatus?.[t]
              return (
                <option key={t} value={t} disabled={!!exists}>
                  {t}{exists ? ' (already exists)' : ''}
                </option>
              )
            })}
          </select>
        )}
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={block?.title ?? ''} />
      </div>

      {renderFields()}

      <MarkdownEditor name="body_md" defaultValue={block?.body_md ?? ''} />

      <div className="flex items-center gap-2">
        <input type="checkbox" id="visible" name="visible" defaultChecked={block?.visible ?? true} className="rounded border" />
        <Label htmlFor="visible" className="text-sm font-normal">Visible on landing page</Label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Create'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/dashboard/content')}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
