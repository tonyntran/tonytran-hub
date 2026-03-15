'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ExperienceMetadata } from '@/lib/types'

interface Props {
  metadata?: ExperienceMetadata
}

export function ExperienceFields({ metadata }: Props) {
  const [currentlyWorking, setCurrentlyWorking] = useState(metadata?.end_date === null)

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" defaultValue={metadata?.company ?? ''} required />
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <Input id="role" name="role" defaultValue={metadata?.role ?? ''} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Start Date (YYYY-MM)</Label>
          <Input id="start_date" name="start_date" placeholder="2023-01" defaultValue={metadata?.start_date ?? ''} required />
        </div>
        <div>
          <Label htmlFor="end_date">End Date (YYYY-MM)</Label>
          <Input id="end_date" name="end_date" placeholder="2024-06" defaultValue={metadata?.end_date ?? ''} disabled={currentlyWorking} required={!currentlyWorking} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="currently_working" name="currently_working" checked={currentlyWorking} onChange={(e) => setCurrentlyWorking(e.target.checked)} className="rounded border" />
        <Label htmlFor="currently_working" className="text-sm font-normal">Currently working here</Label>
      </div>
      <div>
        <Label htmlFor="logo_url">Company Logo URL (optional)</Label>
        <Input id="logo_url" name="logo_url" defaultValue={metadata?.logo_url ?? ''} />
      </div>
    </>
  )
}
