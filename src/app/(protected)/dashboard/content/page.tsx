'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DeleteConfirmDialog } from '@/components/dashboard/DeleteConfirmDialog'
import { SortOrderButtons } from '@/components/dashboard/SortOrderButtons'
import {
  getContentBlocks,
  deleteContentBlock,
  reorderContentBlock,
  getSingletonStatus,
} from '@/lib/actions/content'
import { ALL_CONTENT_TYPES, SINGLETON_TYPES, type ContentBlock, type ContentBlockType } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function ContentListPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-muted-foreground">Loading...</div>}>
      <ContentListInner />
    </Suspense>
  )
}

function ContentListInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeType = searchParams.get('type') as ContentBlockType | null

  const [blocks, setBlocks] = useState<ContentBlock[]>([])
  const [singletonStatus, setSingletonStatus] = useState<Record<string, boolean>>({})

  const loadData = useCallback(async () => {
    const [data, singletons] = await Promise.all([
      getContentBlocks(activeType ?? undefined),
      getSingletonStatus(),
    ])
    setBlocks(data as ContentBlock[])
    setSingletonStatus(singletons)
  }, [activeType])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDelete = async (id: string) => {
    const result = await deleteContentBlock(id)
    if (result.error) {
      toast.error('Failed to delete block')
      return
    }
    toast.success('Content block deleted')
    loadData()
  }

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const result = await reorderContentBlock(id, direction)
    if (result && 'error' in result) {
      toast.error('Failed to reorder')
      return
    }
    loadData()
  }

  const setFilter = (type: string) => {
    if (type === 'all') {
      router.push('/dashboard/content')
    } else {
      router.push(`/dashboard/content?type=${type}`)
    }
  }

  const canCreateNew = !activeType
    || !SINGLETON_TYPES.includes(activeType)
    || !singletonStatus[activeType]

  const showOrder = !!activeType

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return d.toLocaleDateString()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Content</h1>
        {canCreateNew && (
          <Link
            href={activeType ? `/dashboard/content/new?type=${activeType}` : '/dashboard/content/new'}
            className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            + New block
          </Link>
        )}
      </div>

      <Tabs value={activeType ?? 'all'} className="mb-4">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setFilter('all')}>
            All
          </TabsTrigger>
          {ALL_CONTENT_TYPES.map((type) => (
            <TabsTrigger key={type} value={type} onClick={() => setFilter(type)} className="capitalize">
              {type}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Table>
        <TableHeader>
          <TableRow>
            {showOrder && <TableHead className="w-16">Order</TableHead>}
            <TableHead>Title</TableHead>
            {!activeType && <TableHead>Type</TableHead>}
            <TableHead className="w-16">Visible</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blocks.map((block, index) => (
            <TableRow key={block.id} className={cn(!block.visible && 'opacity-50')}>
              {showOrder && (
                <TableCell>
                  <SortOrderButtons
                    sortOrder={block.sort_order}
                    isFirst={index === 0}
                    isLast={index === blocks.length - 1}
                    onReorder={(dir) => handleReorder(block.id, dir)}
                  />
                </TableCell>
              )}
              <TableCell>{block.title ?? '(untitled)'}</TableCell>
              {!activeType && (
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {block.type}
                  </Badge>
                </TableCell>
              )}
              <TableCell>{block.visible ? '●' : '○'}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(block.updated_at)}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/content/${block.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteConfirmDialog
                    title="Delete content block?"
                    description="This will permanently remove this content block."
                    onConfirm={() => handleDelete(block.id)}
                    trigger={<Button variant="ghost" size="sm" className="text-destructive">Delete</Button>}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {blocks.length === 0 && (
            <TableRow>
              <TableCell colSpan={showOrder ? 6 : 5} className="py-8 text-center text-muted-foreground">
                No content blocks yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
