import { NextRequest, NextResponse } from 'next/server'

// Admin control terminal: HTTP Basic over everything.
// Fail closed: the dashboard proxies to the agent's self-management API,
// so no credentials configured -> no access at all.
export function middleware(req: NextRequest) {
  const user = process.env.NAGUAL_DASH_USER
  const pass = process.env.NAGUAL_DASH_PASS
  if (!user || !pass) {
    return new NextResponse('Dashboard disabled: set NAGUAL_DASH_USER and NAGUAL_DASH_PASS', { status: 403 })
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
