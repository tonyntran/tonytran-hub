import { ContentForm } from '@/components/dashboard/ContentForm'
import { getSingletonStatus } from '@/lib/actions/content'
import type { ContentBlockType } from '@/lib/types'

interface Props {
  searchParams: Promise<{ type?: string }>
}

export default async function NewContentPage({ searchParams }: Props) {
  const { type } = await searchParams
  const singletonStatus = await getSingletonStatus()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">New Content Block</h1>
      <ContentForm
        defaultType={type as ContentBlockType | undefined}
        singletonStatus={singletonStatus}
      />
    </div>
  )
}
