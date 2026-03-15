import { createClient } from '@/lib/supabase/server'

export async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthenticated')
  }

  const allowed =
    process.env.ALLOWED_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) ?? []

  if (!allowed.includes(user.email?.toLowerCase() ?? '')) {
    throw new Error('Unauthorized')
  }

  return { supabase, user }
}
