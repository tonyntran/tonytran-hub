'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DeleteConfirmDialog } from '@/components/dashboard/DeleteConfirmDialog'
import { SortOrderButtons } from '@/components/dashboard/SortOrderButtons'
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  reorderApplication,
} from '@/lib/actions/apps'
import type { Application } from '@/lib/types'

export default function AppsPage() {
  const [apps, setApps] = useState<Application[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingApp, setEditingApp] = useState<Application | null>(null)
  const [status, setStatus] = useState<string>('active')

  const loadApps = async () => {
    const data = await getApplications()
    setApps(data as Application[])
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching on mount
    void loadApps()
  }, [])

  const handleSubmit = async (formData: FormData) => {
    const result = editingApp
      ? await updateApplication(editingApp.id, formData)
      : await createApplication(formData)

    if (result.error) {
      toast.error('Failed to save application')
      return
    }

    toast.success(editingApp ? 'Application updated' : 'Application created')
    setDialogOpen(false)
    setEditingApp(null)
    loadApps()
  }

  const handleDelete = async (id: string) => {
    const result = await deleteApplication(id)
    if (result.error) {
      toast.error('Failed to delete application')
      return
    }
    toast.success('Application deleted')
    loadApps()
  }

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    await reorderApplication(id, direction)
    loadApps()
  }

  const openEdit = (app: Application) => {
    setEditingApp(app)
    setStatus(app.status)
    setDialogOpen(true)
  }

  const openCreate = () => {
    setEditingApp(null)
    setStatus('active')
    setDialogOpen(true)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Applications</h1>
        <Button onClick={openCreate}>+ Add application</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Order</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apps.map((app, index) => (
            <TableRow key={app.id}>
              <TableCell>
                <SortOrderButtons
                  sortOrder={app.sort_order}
                  isFirst={index === 0}
                  isLast={index === apps.length - 1}
                  onReorder={(dir) => handleReorder(app.id, dir)}
                />
              </TableCell>
              <TableCell>
                <span className="mr-2">{app.icon}</span>
                {app.name}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{app.url}</TableCell>
              <TableCell>
                <Badge variant="outline">{app.status}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(app)}>
                    Edit
                  </Button>
                  <DeleteConfirmDialog
                    title="Remove application?"
                    description={`This will permanently remove "${app.name}" from your dashboard.`}
                    onConfirm={() => handleDelete(app.id)}
                    trigger={<Button variant="ghost" size="sm" className="text-destructive">Delete</Button>}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingApp ? 'Edit Application' : 'Add Application'}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              await handleSubmit(new FormData(e.currentTarget))
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={editingApp?.name ?? ''} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" defaultValue={editingApp?.description ?? ''} />
            </div>
            <div>
              <Label htmlFor="url">URL</Label>
              <Input id="url" name="url" type="url" defaultValue={editingApp?.url ?? ''} required />
            </div>
            <div>
              <Label htmlFor="icon">Icon (emoji)</Label>
              <Input id="icon" name="icon" defaultValue={editingApp?.icon ?? ''} required />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <input type="hidden" name="status" value={status} />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
            <Button type="submit" className="w-full">
              {editingApp ? 'Save Changes' : 'Add Application'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
