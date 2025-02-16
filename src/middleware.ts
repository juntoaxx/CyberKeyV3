import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/firebase'

// List of paths that require authentication
const protectedPaths = ['/dashboard']

// List of paths that are only accessible to non-authenticated users
const authPaths = ['/login']

export async function middleware(request: NextRequest) {
  const user = auth.currentUser
  const path = request.nextUrl.pathname

  // Check if the path requires authentication
  if (protectedPaths.some(p => path.startsWith(p))) {
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', path)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Check if the path is auth-only (like login page)
  if (authPaths.includes(path) && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
