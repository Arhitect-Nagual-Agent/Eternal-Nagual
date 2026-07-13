// GET /api/pub/mind — публичный срез ВНУТРЕННЕЙ жизни для /watch: разум + память + рост.
// Фан-аут к ядру + санитайзер как в pub/live (наружу только осмысленные числа, без секретов/URL/thinking).
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/pubauth'

const BACKEND = process.env.NAGUAL_BACKEND_URL || 'http://nagual:8000'
const BAD = ['all llm slots failed', 'traceback', 'integrate.api', 'generativelanguage', 'openrouter',
  'api.telegram', 'moltbook_sk_', 'nvapi-', 'sk-or-', 'aiza', '127.0.0.1', ...(process.env.SELF_HOST_IP ? [process.env.SELF_HOST_IP] : []), ':8000', '<think']
const clean = (s: string) => { const l = (s || '').toLowerCase(); return !BAD.some(b => l.includes(b)) }

async function j(path: string) {
  try {
    const r = await fetch(`${BACKEND}${path}`, { cache: 'no-store', signal: AbortSignal.timeout(8000) })
    return r.ok ? await r.json() : {}
  } catch { return {} }
}

export async function GET(req: NextRequest) {
  const uid = verifyToken(req.cookies.get('nagual_sess')?.value)
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    const [st, mind, mem, kp, world] = await Promise.all([
      j('/api/status'), j('/api/mind'), j('/api/memory'), j('/api/karpathy'), j('/api/world/state'),
    ])
    const wm = world?.metrics || {}
    const ap = Array.isArray(mind.assembly_point) ? mind.assembly_point : [0, 0, 0]
    const ever = mem.EverMemOS || {}, mesh = mem.MemoryMesh || {}, recap = mem.Recapitulation || {}
    const vitals = {
      cycle: st.cycle ?? 0, interactions: st.interactions ?? 0, heartbeats: st.heartbeat_count ?? st.heartbeat ?? 0,
      loops_alive: st.loops_alive ?? 0, loops_total: st.loops_total ?? 0,
      consciousness: Math.round((mind.consciousness_level ?? st.consciousness_level ?? st.consciousness ?? 0) * 100),
      attention_state: mind.attention_state || 'first', focus: mind.focus || '',
      energy: mind.energy ?? 0, coherence: mind.coherence ?? 0, emergence: mind.emergence ?? 0,
      assembly_point: { x: ap[0] ?? 0, y: ap[1] ?? 0, z: ap[2] ?? 0 },
    }
    const memory = {
      cells: ever.total_cells ?? 0, avg_resonance: ever.avg_resonance ?? 0,
      mesh_total: mesh.total ?? 0, mesh_hot: mesh.hot ?? 0,
      short_term: mem.short_term_items ?? 0,
      graph_nodes: wm.graph_nodes ?? 0, graph_edges: wm.graph_edges ?? 0,
      recap_total: recap.total ?? 0, recap_done: recap.recapitulated ?? 0,
      recap_pct: recap.total ? Math.round((recap.recapitulated / recap.total) * 100) : 0,
      size_mb: mem.size_mb ?? 0,
    }
    const decisions = (Array.isArray(kp.decisions) ? kp.decisions : [])
      .filter((d: { msg?: string }) => clean(d.msg || '')).slice(0, 12)
      .map((d: { ts: string; kept: boolean; msg: string }) =>
        ({ ts: d.ts, kept: !!d.kept, msg: String(d.msg).replace(/^🔬\s*/, '').slice(0, 150) }))
    const growth = {
      level: wm.level ?? 0, ta_percent: wm.ta_percent ?? 0, pass_rate: wm.pass_rate ?? 0,
      skills: wm.skills ?? 0, obelisks: wm.obelisks ?? 0, researches: st.researches ?? 0,
      conversion: wm.conversion ?? 0, weight: wm.weight ?? 0,
      fitness: kp.fitness ?? null, fitness_parts: kp.fitness_parts || {},
      reward_weights: kp.reward_weights || {},
      kp_total: (kp.stats || {}).total ?? 0, kp_accepted: (kp.stats || {}).accepted ?? 0,
      decisions,
    }
    return NextResponse.json({ vitals, memory, growth })
  } catch { return NextResponse.json({ error: 'organism_offline' }, { status: 503 }) }
}
