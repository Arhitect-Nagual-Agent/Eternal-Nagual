// GET /api/pub/live — ПУБЛИЧНОЕ наблюдение за организмом (Костя 04.07: «доступ к логу петель,
// поискам сети — не управление как у меня, а наблюдение»). Whitelist kind + санитайзер:
// наружу только осмысленная жизнь, никаких ошибок роутера / URL провайдеров / ключей / IP.
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/pubauth'

const BACKEND = process.env.NAGUAL_BACKEND_URL || 'http://nagual:8000'
const KINDS = new Set(['insight', 'milestone', 'research', 'goal', 'goal_insight', 'reflection',
  'moltbook', 'intent', 'curiosity', 'stalking', 'evolution', 'orchestrate', 'world', 'skill', 'gem', 'bridge_memory', 'conduct', 'assembly', 'energy', 'latent_core', 'reflect'])   // 06.07 Костя: показывать внутренние процессы/дирижёра/координацию организма
const BAD = ['all llm slots failed', 'client error', 'http error', 'traceback', 'integrate.api',
  'generativelanguage', 'openrouter', 'api.telegram', 'moltbook_sk_', 'nvapi-', 'sk-or-', 'aiza',
  '127.0.0.1', ...(process.env.SELF_HOST_IP ? [process.env.SELF_HOST_IP] : []), ':8000', 'deadline:', 'docker ', 'ssh ']
const clean = (s: string) => { const low = (s || '').toLowerCase(); return !BAD.some(b => low.includes(b)) }

export async function GET(req: NextRequest) {
  const uid = verifyToken(req.cookies.get('nagual_sess')?.value)
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    const [plR, rsR] = await Promise.all([
      fetch(`${BACKEND}/api/process_log`, { cache: 'no-store' }),
      fetch(`${BACKEND}/api/research`, { cache: 'no-store' }),
    ])
    const pl = await plR.json().catch(() => ({}))
    const rs = await rsR.json().catch(() => ({}))
    const events = (Array.isArray(pl?.events) ? pl.events : [])
      .filter((e: { kind: string; msg: string }) => KINDS.has(e.kind) && clean(e.msg))
      .slice(-40).reverse()
      .map((e: { ts: string; kind: string; msg: string }) => ({ ts: e.ts, kind: e.kind, msg: String(e.msg).slice(0, 220) }))
    const research = (Array.isArray(rs?.log) ? rs.log : [])
      .filter((r: { topic?: string; findings?: string }) => clean(r.topic || '') && clean(r.findings || ''))
      .slice(0, 12)
      .map((r: { timestamp: string; topic?: string; depth?: string; confidence?: number; findings?: string }) => ({
        ts: r.timestamp, topic: String(r.topic || '').slice(0, 120), depth: r.depth || '',
        confidence: r.confidence ?? null, snippet: String(r.findings || '').slice(0, 220),
      }))
    return NextResponse.json({ events, research, research_total: rs?.total ?? null })
  } catch {
    return NextResponse.json({ error: 'organism_offline' }, { status: 503 })
  }
}
