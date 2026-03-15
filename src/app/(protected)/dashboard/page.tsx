import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AppCard } from '@/components/dashboard/AppCard'
import { Card, CardContent } from '@/components/ui/card'
import { ALL_CONTENT_TYPES } from '@/lib/types'
import type { Application, ContentBlock } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ data: apps }, { data: blocks }] = await Promise.all([
    supabase.from('applications').select('*').order('sort_order'),
    supabase.from('content_blocks').select('type'),
  ])

  const typeCounts = ALL_CONTENT_TYPES.map((type) => ({
    type,
    count: (blocks as ContentBlock[] | null)?.filter((b) => b.type === type).length ?? 0,
  }))

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, Tony</h1>
          <p className="text-sm text-muted-foreground">
            Manage your portfolio and applications
          </p>
        </div>
        <Link href="/" className="text-sm text-primary hover:underline">
          View live site →
        </Link>
      </div>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Applications</h2>
          <Link href="/dashboard/apps" className="text-sm text-primary hover:underline">
            Manage →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(apps as Application[] | null)?.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
          <Link href="/dashboard/apps">
            <Card className="border-dashed transition-colors hover:bg-accent">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="text-2xl text-muted-foreground">+</span>
                <span className="text-sm text-muted-foreground">Add application</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Landing Page Content</h2>
          <Link href="/dashboard/content" className="text-sm text-primary hover:underline">
            Manage all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {typeCounts.map(({ type, count }) => (
            <Card key={type}>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold">{count}</p>
                <p className="text-xs capitalize text-muted-foreground">{type}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
