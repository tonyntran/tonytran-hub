import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PROTECTED_ROUTES = ['/dashboard']

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

function isAllowedEmail(email: string | undefined): boolean {
  if (!email) return false
  const allowed = process.env.ALLOWED_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) ?? []
  return allowed.includes(email.toLowerCase())
}

export async function middleware(request: NextRequest) {
  const { user, supabaseResponse, supabase } = await updateSession(request)
  const { pathname } = request.nextUrl

  if (!isProtectedRoute(pathname)) {
    return supabaseResponse
  }

  // No session — redirect to login
  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    return NextResponse.redirect(loginUrl)
  }

  // Session exists but email not in allowlist — sign out and redirect to error
  if (!isAllowedEmail(user.email)) {
    await supabase.auth.signOut()
    const errorUrl = request.nextUrl.clone()
    errorUrl.pathname = '/auth/error'
    errorUrl.searchParams.set('reason', 'unauthorized')
    return NextResponse.redirect(errorUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
