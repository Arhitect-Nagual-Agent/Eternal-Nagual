// POST /api/pub/login — вход юзера Витрины
import { NextRequest, NextResponse } from 'next/server'
import { loadUsers, verifyPassword, signToken } from '@/lib/pubauth'

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 })
  }
  const email = (body.email || '').trim().toLowerCase()
  const user = loadUsers().find(u => u.email === email)
  if (!user || !verifyPassword(body.password || '', user)) {
    return NextResponse.json({ error: 'invalid' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true, id: user.id, points: user.points })
  res.cookies.set('nagual_sess', signToken(user.id), {
    httpOnly: true, sameSite: 'lax', maxAge: 30 * 86400, path: '/',
  })
  return res
}
