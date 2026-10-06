'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { slugify } from '@/lib/slugify'
import { uploadImage } from '@/lib/supabase/uploadImage'
import { CUSTOM_POST_KEYS } from '@/components/landing/blog/posts/registry'
import type { BlogPostMetadata } from '@/lib/types'

interface Props {
  metadata?: BlogPostMetadata
}

export function BlogPostFields({ metadata }: Props) {
  const [slug, setSlug] = useState(metadata?.slug ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(metadata?.cover_image_url ?? '')
  const [uploading, setUploading] = useState(false)

  const generateSlug = () => {
    const titleInput = document.getElementById('title') as HTMLInputElement | null
    if (titleInput?.value) {
      setSlug(slugify(titleInput.value))
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage('blog-images', file)
      setCoverImageUrl(url)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Image upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <>
      <div>
        <Label htmlFor="slug">Slug</Label>
        <div className="flex gap-2">
          <Input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="week-4-recap"
          />
          <Button type="button" variant="outline" onClick={generateSlug}>
            Generate from title
          </Button>
        </div>
      </div>
      <div>
        <Label htmlFor="excerpt">Excerpt (optional)</Label>
        <Textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          defaultValue={metadata?.excerpt ?? ''}
          placeholder="Shown on the blog list page"
        />
      </div>
      <div>
        <Label htmlFor="cover_image_url">Cover Image (optional)</Label>
        <div className="flex gap-2">
          <Input
            id="cover_image_url"
            name="cover_image_url"
            type="url"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://..."
          />
          <label className="inline-flex h-9 cursor-pointer items-center rounded-md border px-3 text-sm">
            {uploading ? 'Uploading...' : 'Upload'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>
      <div>
        <Label htmlFor="component">Custom layout (optional)</Label>
        <select
          id="component"
          name="component"
          defaultValue={metadata?.component ?? ''}
          className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
        >
          <option value="">Markdown (default)</option>
          {CUSTOM_POST_KEYS.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted-foreground">
          Renders a hand-built React body instead of the markdown below. The markdown is kept
          but not shown.
        </p>
      </div>
    </>
  )
}
