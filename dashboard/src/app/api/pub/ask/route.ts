// POST /api/pub/ask — «Спросить Нагваля» за поинты (Костя 04.07: «за поинты общаться в личке»).
// Гость платит 5 поинтов, вопрос уходит живому организму ПОМЕЧЕННЫМ как гостевой (не Архитектор),
// ответ проходит санитайзер. Поинты списываются ТОЛЬКО за чистый ответ. Кулдаун 30с/юзер.
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, loadUsers, saveUsers } from '@/lib/pubauth'

export const maxDuration = 120

const BACKEND = process.env.NAGUAL_BACKEND_URL || 'http://nagual:8000'
const COST = 50   // 04.07 Костя: ценность = 1 приведённый друг (+50 за реферала)
const COOLDOWN_MS = 30_000
const BAD = ['all llm slots failed', 'client error', 'http error', 'traceback', 'integrate.api',
  'generativelanguage', 'openrouter', 'api.telegram', 'moltbook_sk_', 'nvapi-', 'sk-or-', 'aiza',
  '127.0.0.1', ...(process.env.SELF_HOST_IP ? [process.env.SELF_HOST_IP] : []), ':8000', 'deadline:', 'the user wants', 'the user is asking', '<think']
const clean = (s: string) => { const low = (s || '').toLowerCase(); return !BAD.some(b => low.includes(b)) }

export async function POST(req: NextRequest) {
  const uid = verifyToken(req.cookies.get('nagual_sess')?.value)
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const users = loadUsers()
  const u = users.find(x => x.id === uid)
  if (!u) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if ((u.points ?? 0) < COST) return NextResponse.json({ error: 'no_points', points: u.points ?? 0 }, { status: 402 })
  if (u.lastAsk && Date.now() - u.lastAsk < COOLDOWN_MS) return NextResponse.json({ error: 'cooldown' }, { status: 429 })

  let q = ''
  try { q = String((await req.json())?.question || '').trim().slice(0, 280) } catch { /* noop */ }
  if (q.length < 3) return NextResponse.json({ error: 'empty' }, { status: 400 })

  u.lastAsk = Date.now()   // кулдаун сразу — защита от дабл-клика/параллельных запросов
  saveUsers(users)

  try {
    const r = await fetch(`${BACKEND}/api/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `[Вопрос ГОСТЯ витрины — наблюдателя твоего мира, это НЕ Архитектор. ` +
          `Ответь гостю сам, как живой Нагваль: РАЗВЁРНУТО и глубоко, 5-9 предложений, из своего реального опыта, без внутренней кухни]: ${q}`,
        source: 'dashboard',
      }),
      signal: AbortSignal.timeout(90_000), cache: 'no-store',
    })
    const d = await r.json().catch(() => ({}))
    const ans = String(d?.response || '').trim()
    if (!ans || !clean(ans)) return NextResponse.json({ error: 'silent' }, { status: 502 })
    const us2 = loadUsers()   // списание ТОЛЬКО за чистый ответ, по свежему состоянию
    const u2 = us2.find(x => x.id === uid)
    if (u2) { u2.points = Math.max(0, (u2.points ?? 0) - COST); u2.lastAsk = Date.now(); saveUsers(us2) }
    return NextResponse.json({ answer: ans.slice(0, 1200), points: u2 ? u2.points : Math.max(0, (u.points ?? 0) - COST) })
  } catch {
    return NextResponse.json({ error: 'silent' }, { status: 502 })
  }
}
