// GET /api/pub/world — ПУБЛИЧНЫЙ read-only срез мира «Тональ» (ТЗ B-3).
// Серверный фильтр: юзер видит жизнь организма, но НЕ внутренности (знаки Духа,
// admin-API, IP, ключи). Действий (/act, upload) в этом контуре не существует.
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/pubauth'

const BACKEND = process.env.NAGUAL_BACKEND_URL || 'http://nagual:8000'

export async function GET(req: NextRequest) {
  const uid = verifyToken(req.cookies.get('nagual_sess')?.value)
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    const [stR, evR, mbR] = await Promise.all([
      fetch(`${BACKEND}/api/world/state`, { cache: 'no-store' }),
      fetch(`${BACKEND}/api/world/events`, { cache: 'no-store' }),
      fetch(`${BACKEND}/api/moltbook/public`, { cache: 'no-store' }).catch(() => null),
    ])
    const st = await stR.json()
    const ev = await evR.json()
    const mb = mbR ? await mbR.json().catch(() => ({})) : {}
    const body = st.body || {}
    return NextResponse.json({
      // тело: что делает и почему — сердце наблюдения
      body: {
        q: body.q, r: body.r, loc: body.loc, target: body.target,
        action: body.action, reason: body.reason, stamina: body.stamina, glow: body.glow,
      },
      metrics: st.metrics || {},
      weather: st.weather || 'ясно',
      locs: st.locs || {},
      obelisk_list: (st.obelisk_list || []).map((o: { q: number; r: number; text: string; ts: string }) => ({ q: o.q, r: o.r, text: o.text, ts: o.ts })),
      grave_count: (st.grave_list || []).length,
      events: (Array.isArray(ev?.events) ? ev.events : []).slice(-20).map(
        (e: { ts: string; kind: string; msg: string; loc: string }) => ({ ts: e.ts, kind: e.kind, msg: e.msg, loc: e.loc })),
      moltbook: { karma: mb.karma ?? (st.metrics || {}).karma ?? 0, goal: mb.goal || 10000 },
      ts: st.ts,
    })
  } catch {
    return NextResponse.json({ error: 'organism_offline' }, { status: 503 })
  }
}
