'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface Props {
  name: string
  defaultValue: string
}

export function MarkdownEditor({ name, defaultValue }: Props) {
  const [value, setValue] = useState(defaultValue)
  const [preview, setPreview] = useState(false)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Label>Description (Markdown)</Label>
        <Button type="button" variant="ghost" size="sm" onClick={() => setPreview(!preview)}>
          {preview ? 'Edit' : 'Preview'}
        </Button>
      </div>
      {/* Hidden input ensures body_md is always in FormData, even in preview mode */}
      <input type="hidden" name={name} value={value} />
      {preview ? (
        <div className="prose prose-sm dark:prose-invert min-h-[120px] rounded-md border p-3">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || '*No content*'}</ReactMarkdown>
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={6}
          placeholder="Write your description in markdown..."
        />
      )}
    </div>
  )
}
