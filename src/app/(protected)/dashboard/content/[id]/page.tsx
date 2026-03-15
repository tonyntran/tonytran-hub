import { notFound } from 'next/navigation'
import { ContentForm } from '@/components/dashboard/ContentForm'
import { getContentBlock } from '@/lib/actions/content'
import type { ContentBlock } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditContentPage({ params }: Props) {
  const { id } = await params
  let block: ContentBlock

  try {
    block = (await getContentBlock(id)) as ContentBlock
  } catch {
    notFound()
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit Content Block</h1>
      <ContentForm block={block} />
    </div>
  )
}
