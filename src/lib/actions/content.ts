'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { metadataSchemaMap } from '@/lib/schemas'
import { SINGLETON_TYPES, type ContentBlockType } from '@/lib/types'

export async function getContentBlocks(type?: ContentBlockType) {
  const supabase = await createClient()
  let query = supabase.from('content_blocks').select('*').order('sort_order', { ascending: true })

  if (type) {
    query = query.eq('type', type)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

export async function getContentBlock(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_blocks')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function createContentBlock(type: ContentBlockType, formData: FormData) {
  const { supabase } = await requireAuth()

  // Singleton enforcement
  if (SINGLETON_TYPES.includes(type)) {
    const { data: existing } = await supabase
      .from('content_blocks')
      .select('id')
      .eq('type', type)
      .maybeSingle()

    if (existing) {
      return { error: { server: [`A ${type} block already exists.`] } }
    }
  }

  // Parse metadata from form
  const metadata = extractMetadata(type, formData)
  const schema = metadataSchemaMap[type]
  const parsed = schema.safeParse(metadata)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  // Get next sort_order for this type
  const { data: maxRow } = await supabase
    .from('content_blocks')
    .select('sort_order')
    .eq('type', type)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextOrder = (maxRow?.sort_order ?? -1) + 1

  const { error } = await supabase.from('content_blocks').insert({
    type,
    title: (formData.get('title') as string) || null,
    metadata: parsed.data,
    body_md: (formData.get('body_md') as string) || null,
    sort_order: nextOrder,
    visible: formData.get('visible') === 'on',
  })

  if (error) return { error: { server: [error.message] } }

  revalidatePath('/')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/content')
  return { success: true }
}

export async function updateContentBlock(id: string, type: ContentBlockType, formData: FormData) {
  const metadata = extractMetadata(type, formData)
  const schema = metadataSchemaMap[type]
  const parsed = schema.safeParse(metadata)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const { supabase } = await requireAuth()
  const { error } = await supabase
    .from('content_blocks')
    .update({
      title: (formData.get('title') as string) || null,
      metadata: parsed.data,
      body_md: (formData.get('body_md') as string) || null,
      visible: formData.get('visible') === 'on',
    })
    .eq('id', id)

  if (error) return { error: { server: [error.message] } }

  revalidatePath('/')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/content')
  return { success: true }
}

export async function deleteContentBlock(id: string) {
  const { supabase } = await requireAuth()

  const { data: block } = await supabase
    .from('content_blocks')
    .select('type')
    .eq('id', id)
    .single()

  if (!block) return { error: 'Block not found' }

  const { error } = await supabase.from('content_blocks').delete().eq('id', id)
  if (error) return { error: error.message }

  // Re-normalize sort_order for this type
  const { data: remaining } = await supabase
    .from('content_blocks')
    .select('id')
    .eq('type', block.type)
    .order('sort_order', { ascending: true })

  if (remaining) {
    await Promise.all(
      remaining.map((item, i) =>
        supabase.from('content_blocks').update({ sort_order: i }).eq('id', item.id)
      )
    )
  }

  revalidatePath('/')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/content')
  return { success: true }
}

export async function reorderContentBlock(id: string, direction: 'up' | 'down') {
  const { supabase } = await requireAuth()

  const { data: block } = await supabase
    .from('content_blocks')
    .select('type, sort_order')
    .eq('id', id)
    .single()

  if (!block) return { error: 'Block not found' }

  const { data: blocks } = await supabase
    .from('content_blocks')
    .select('id, sort_order')
    .eq('type', block.type)
    .order('sort_order', { ascending: true })

  if (!blocks) return { error: 'Failed to fetch blocks' }

  const currentIndex = blocks.findIndex((b) => b.id === id)
  const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  if (swapIndex < 0 || swapIndex >= blocks.length) return { error: 'Cannot move further' }

  const current = blocks[currentIndex]
  const swap = blocks[swapIndex]

  await supabase.from('content_blocks').update({ sort_order: swap.sort_order }).eq('id', current.id)
  await supabase.from('content_blocks').update({ sort_order: current.sort_order }).eq('id', swap.id)

  revalidatePath('/')
  revalidatePath('/dashboard/content')
  return { success: true }
}

export async function getSingletonStatus(): Promise<Record<string, boolean>> {
  const supabase = await createClient()
  const result: Record<string, boolean> = {}

  for (const type of SINGLETON_TYPES) {
    const { data } = await supabase
      .from('content_blocks')
      .select('id')
      .eq('type', type)
      .maybeSingle()
    result[type] = !!data
  }

  return result
}

function extractMetadata(type: ContentBlockType, formData: FormData): Record<string, unknown> {
  switch (type) {
    case 'hero':
      return {
        tagline: formData.get('tagline'),
        subtitle: formData.get('subtitle'),
      }
    case 'about':
      return {
        avatar_url: formData.get('avatar_url'),
        location: formData.get('location'),
        resume_url: (formData.get('resume_url') as string) || null,
      }
    case 'experience':
      return {
        company: formData.get('company'),
        role: formData.get('role'),
        start_date: formData.get('start_date'),
        end_date: formData.get('currently_working') === 'on' ? null : formData.get('end_date'),
        logo_url: (formData.get('logo_url') as string) || null,
      }
    case 'skill':
      return {
        category: formData.get('category'),
        level: (formData.get('level') as string) || null,
      }
    case 'project': {
      const techStackRaw = formData.get('tech_stack') as string
      return {
        url: (formData.get('url') as string) || null,
        github_url: (formData.get('github_url') as string) || null,
        tech_stack: techStackRaw ? techStackRaw.split(',').map((s) => s.trim()).filter(Boolean) : [],
        image_url: (formData.get('image_url') as string) || null,
        is_featured: formData.get('is_featured') === 'on',
      }
    }
    case 'contact':
      return {
        platform: formData.get('platform'),
        url: formData.get('contact_url'),
        icon: formData.get('icon'),
        display_text: formData.get('display_text'),
      }
  }
}
