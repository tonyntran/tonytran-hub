'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Kanban, BarChart3, Users, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/actions/auth'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'Content', href: '/dashboard/content' },
  { label: 'Applications', href: '/dashboard/apps' },
]

const futureModules = [
  { label: 'Kanban', icon: Kanban },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'CRM', icon: Users },
  { label: 'Costs', icon: DollarSign },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-56 flex-col border-r bg-card">
      <div className="border-b p-4">
        <h2 className="font-bold">Tony&apos;s Hub</h2>
        <p className="text-xs text-muted-foreground">Dashboard</p>
      </div>

      <nav className="flex-1 py-2">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block px-4 py-2 text-sm transition-colors',
                isActive
                  ? 'border-r-2 border-primary bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.label}
            </Link>
          )
        })}

        <div className="mt-4 border-t px-4 pt-4">
          <p className="mb-2 text-xs text-muted-foreground">Coming soon</p>
          {futureModules.map((mod) => (
            <div
              key={mod.label}
              className="flex items-center gap-2 py-1.5 text-xs text-muted-foreground/40"
            >
              <mod.icon className="h-3.5 w-3.5" />
              <span>{mod.label}</span>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t p-4">
        <form action={signOut}>
          <Button variant="ghost" size="sm" className="w-full justify-start" type="submit">
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  )
}
