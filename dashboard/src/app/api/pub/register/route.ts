// POST /api/pub/register — регистрация юзера Витрины (email+пароль, реферал ?ref=)
import { NextRequest, NextResponse } from 'next/server'
import { loadUsers, saveUsers, hashPassword, signToken, SIGNUP_BONUS, REFERRAL_BONUS, PubUser } from '@/lib/pubauth'
import { randomBytes } from 'crypto'

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; ref?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 })
  }
  const email = (body.email || '').trim().toLowerCase()
  const password = body.password || ''
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: 'bad_email' }, { status: 400 })
  if (password.length < 6) return NextResponse.json({ error: 'weak_password' }, { status: 400 })

  const users = loadUsers()
  if (users.some(u => u.email === email)) return NextResponse.json({ error: 'exists' }, { status: 409 })

  const { ph, salt } = hashPassword(password)
  const referrer = body.ref && users.some(u => u.id === body.ref) ? String(body.ref) : null
  const user: PubUser = {
    id: randomBytes(8).toString('hex'),
    email, ph, salt,
    points: SIGNUP_BONUS,
    referrer,
    created: new Date().toISOString(),
    lastDaily: new Date().toISOString().slice(0, 10),
    plan: 'early_access',
  }
  users.push(user)
  if (referrer) {
    const r = users.find(u => u.id === referrer)
    if (r) r.points += REFERRAL_BONUS
  }
  saveUsers(users)

  const res = NextResponse.json({ ok: true, id: user.id, points: user.points })
  res.cookies.set('nagual_sess', signToken(user.id), {
    httpOnly: true, sameSite: 'lax', maxAge: 30 * 86400, path: '/',
  })
  return res
}
