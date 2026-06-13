import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isLoginRoute = request.nextUrl.pathname === '/login'

  if (isDashboardRoute) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    try {
      await decrypt(sessionCookie)
      return NextResponse.next()
    } catch (e) {
      // Invalid token
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('session')
      return response
    }
  }

  if (isLoginRoute && sessionCookie) {
    try {
      await decrypt(sessionCookie)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch (e) {
      // Allow them to login if token is bad
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
