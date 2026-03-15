'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { applicationSchema } from '@/lib/schemas'

export async function getApplications() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function createApplication(formData: FormData) {
  const raw = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    url: formData.get('url') as string,
    icon: formData.get('icon') as string,
    status: formData.get('status') as string,
  }

  const parsed = applicationSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const supabase = await createClient()

  // Get next sort_order
  const { data: maxRow } = await supabase
    .from('applications')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextOrder = (maxRow?.sort_order ?? -1) + 1

  const { error } = await supabase
    .from('applications')
    .insert({ ...parsed.data, sort_order: nextOrder })

  if (error) return { error: { server: [error.message] } }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/apps')
  return { success: true }
}

export async function updateApplication(id: string, formData: FormData) {
  const raw = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    url: formData.get('url') as string,
    icon: formData.get('icon') as string,
    status: formData.get('status') as string,
  }

  const parsed = applicationSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('applications')
    .update(parsed.data)
    .eq('id', id)

  if (error) return { error: { server: [error.message] } }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/apps')
  return { success: true }
}

export async function deleteApplication(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('applications').delete().eq('id', id)
  if (error) return { error: error.message }

  // Re-normalize sort_order
  const { data: remaining } = await supabase
    .from('applications')
    .select('id')
    .order('sort_order', { ascending: true })

  if (remaining) {
    await Promise.all(
      remaining.map((app, i) =>
        supabase.from('applications').update({ sort_order: i }).eq('id', app.id)
      )
    )
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/apps')
  return { success: true }
}

export async function reorderApplication(id: string, direction: 'up' | 'down') {
  const supabase = await createClient()

  const { data: apps } = await supabase
    .from('applications')
    .select('id, sort_order')
    .order('sort_order', { ascending: true })

  if (!apps) return { error: 'Failed to fetch applications' }

  const currentIndex = apps.findIndex((app) => app.id === id)
  if (currentIndex === -1) return { error: 'Application not found' }

  const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  if (swapIndex < 0 || swapIndex >= apps.length) return { error: 'Cannot move further' }

  const current = apps[currentIndex]
  const swap = apps[swapIndex]

  await supabase
    .from('applications')
    .update({ sort_order: swap.sort_order })
    .eq('id', current.id)

  await supabase
    .from('applications')
    .update({ sort_order: current.sort_order })
    .eq('id', swap.id)

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/apps')
  return { success: true }
}
