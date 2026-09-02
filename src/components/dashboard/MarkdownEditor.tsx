'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { uploadImage } from '@/lib/supabase/uploadImage'

interface Props {
  name: string
  defaultValue: string
  label?: string
}

export function MarkdownEditor({ name, defaultValue, label = 'Description (Markdown)' }: Props) {
  const [value, setValue] = useState(defaultValue)
  const [preview, setPreview] = useState(false)
  const [uploading, setUploading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const textarea = textareaRef.current
    const start = textarea?.selectionStart
    const end = textarea?.selectionEnd
    setUploading(true)
    try {
      const url = await uploadImage('blog-images', file)
      const markdown = `![](${url})`
      if (start != null && end != null) {
        setValue((prev) => prev.slice(0, start) + markdown + prev.slice(end))
      } else {
        setValue((prev) => prev + markdown)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Image upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
          <label className="inline-flex h-8 cursor-pointer items-center rounded-md px-2.5 text-sm text-muted-foreground hover:text-foreground">
            {uploading ? 'Uploading...' : 'Insert image'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={insertImage}
              disabled={preview || uploading}
            />
          </label>
          <Button type="button" variant="ghost" size="sm" onClick={() => setPreview(!preview)}>
            {preview ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>
      {/* Hidden input ensures body_md is always in FormData, even in preview mode */}
      <input type="hidden" name={name} value={value} />
      {preview ? (
        <div className="prose prose-sm dark:prose-invert min-h-[120px] rounded-md border p-3">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || '*No content*'}</ReactMarkdown>
        </div>
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={6}
          placeholder="Write your description in markdown..."
        />
      )}
    </div>
  )
}
