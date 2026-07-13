import { NextRequest, NextResponse } from 'next/server'

// Два контура доступа (ТЗ Витрина 2.2):
//  • ПУБЛИЧНАЯ зона (юзеры): /join /watch /account + /api/pub/* — своя cookie-auth (pubauth)
//  • АДМИНКА Кости (всё остальное, включая /api/nagual/*): HTTP Basic как было
const PUBLIC_PREFIXES = ['/join', '/watch', '/account', '/api/pub/']

export function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname
  if (PUBLIC_PREFIXES.some(x => p === x || p === x.replace(/\/$/, '') || p.startsWith(x))) {
    return NextResponse.next()
  }
  // Fail closed: the admin zone proxies to the agent's self-management API.
  // No credentials configured -> no admin access at all (public zone still works).
  const user = process.env.NAGUAL_DASH_USER
  const pass = process.env.NAGUAL_DASH_PASS
  if (!user || !pass) {
    return new NextResponse('Admin zone disabled: set NAGUAL_DASH_USER and NAGUAL_DASH_PASS', { status: 403 })
  }
  const auth = req.headers.get('authorization')
  if (auth) {
    const [scheme, encoded] = auth.split(' ')
    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded)
      const i = decoded.indexOf(':')
      if (i > -1 && decoded.slice(0, i) === user && decoded.slice(i + 1) === pass) {
        return NextResponse.next()
      }
    }
  }
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Nagual Control Terminal"' },
  })
}

export const config = {
  // protect everything except Next static assets and the avatar image
  matcher: ['/((?!_next/static|_next/image|favicon.ico|nagual-avatar.jpg|logo.svg).*)'],
}
