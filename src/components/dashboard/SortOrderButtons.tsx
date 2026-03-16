'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface Props {
  sortOrder: number
  isFirst: boolean
  isLast: boolean
  onReorder: (direction: 'up' | 'down') => Promise<void>
}

export function SortOrderButtons({ sortOrder, isFirst, isLast, onReorder }: Props) {
  const [loading, setLoading] = useState(false)

  const handleReorder = async (direction: 'up' | 'down') => {
    setLoading(true)
    await onReorder(direction)
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <Button
        variant="ghost"
        size="sm"
        className="h-5 w-5 p-0 text-xs"
        disabled={isFirst || loading}
        onClick={() => handleReorder('up')}
      >
        ▲
      </Button>
      <span className="text-xs">{sortOrder}</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-5 w-5 p-0 text-xs"
        disabled={isLast || loading}
        onClick={() => handleReorder('down')}
      >
        ▼
      </Button>
    </div>
  )
}
