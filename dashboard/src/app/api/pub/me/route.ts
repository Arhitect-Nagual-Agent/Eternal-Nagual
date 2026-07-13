// GET /api/pub/me — профиль текущего юзера (+daily-бонус поинтов раз в сутки)
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, grantDaily } from '@/lib/pubauth'

export async function GET(req: NextRequest) {
  const uid = verifyToken(req.cookies.get('nagual_sess')?.value)
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const user = grantDaily(uid)
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  return NextResponse.json({
    id: user.id,
    email: user.email,
    points: user.points,
    plan: user.plan,
    referrer: user.referrer,
    created: user.created,
  })
}
