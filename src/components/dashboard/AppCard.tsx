import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Application } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  app: Application
}

const statusStyles: Record<string, string> = {
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  maintenance: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  disabled: 'bg-muted text-muted-foreground border-muted',
}

export function AppCard({ app }: Props) {
  const isDisabled = app.status === 'disabled'

  const content = (
    <Card className={cn('transition-colors', isDisabled ? 'opacity-50' : 'hover:bg-accent')}>
      <CardContent className="flex items-center gap-3 p-4">
        <span className="text-2xl">{app.icon}</span>
        <div className="flex-1">
          <p className="font-semibold">{app.name}</p>
          {app.description && (
            <p className="text-xs text-muted-foreground">{app.description}</p>
          )}
          <Badge variant="outline" className={cn('mt-1', statusStyles[app.status])}>
            {app.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )

  if (isDisabled) return content

  return (
    <a href={app.url} target="_blank" rel="noopener noreferrer" className="block">
      {content}
    </a>
  )
}
