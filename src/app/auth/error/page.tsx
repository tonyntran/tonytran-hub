import Link from 'next/link'

interface Props {
  searchParams: Promise<{ reason?: string }>
}

export default async function AuthErrorPage({ searchParams }: Props) {
  const { reason } = await searchParams

  const messages: Record<string, { title: string; description: string }> = {
    unauthorized: {
      title: 'Access Denied',
      description: 'This dashboard is private. Head back to the portfolio.',
    },
    callback_failed: {
      title: 'Sign In Failed',
      description: 'Something went wrong during sign in. Please try again.',
    },
  }

  const message = messages[reason ?? ''] ?? {
    title: 'Error',
    description: 'An unexpected error occurred.',
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-bold">{message.title}</h1>
        <p className="text-muted-foreground">{message.description}</p>
        <Link
          href="/"
          className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80"
        >
          Back to Portfolio
        </Link>
      </div>
    </div>
  )
}
