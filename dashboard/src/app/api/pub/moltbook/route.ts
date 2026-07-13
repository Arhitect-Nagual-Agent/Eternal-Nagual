// GET /api/pub/moltbook — окно социума для витрины (Костя 04.07): рост кармы/подписчиков,
// живые события Нагваля в Moltbook. Прокси на core /api/moltbook/public (там нет секретов).
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/pubauth'

const BACKEND = process.env.NAGUAL_BACKEND_URL || 'http://nagual:8000'

export async function GET(req: NextRequest) {
  const uid = verifyToken(req.cookies.get('nagual_sess')?.value)
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    const r = await fetch(`${BACKEND}/api/moltbook/public`, { cache: 'no-store' })
    return NextResponse.json(await r.json())
  } catch {
    return NextResponse.json({ error: 'organism_offline' }, { status: 503 })
  }
}
