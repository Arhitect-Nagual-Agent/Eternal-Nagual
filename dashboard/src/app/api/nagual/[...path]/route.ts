import { NextRequest, NextResponse } from 'next/server'

// Backend URL -- the Python Nagual core.py (FastAPI) server
const BACKEND_URL = process.env.NAGUAL_BACKEND_URL || 'http://localhost:8000'

// core.py serves everything under /api/* (e.g. /api/status, /api/chat).
function backendUrl(path: string[]): string {
  return `${BACKEND_URL}/api/${path.join('/')}`
}

// ── Mappers: core.py shape -> shape expected by the frontend (src/lib/types.ts) ──
// Endpoints whose structure already matches are passed through as-is.
// toltec is served LIVE by core.py (/api/toltec) since 30.06.

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapStatus(d: any) {
  const start = d.uptime_start ? new Date(d.uptime_start).getTime() : 0
  const sec = start ? Math.max(0, Math.floor((Date.now() - start) / 1000)) : 0
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60)
  const recentErrors = Array.isArray(d.errors) ? d.errors.length : 0
  return {
    cycle: d.cycle ?? 0,
    interactions: d.interactions ?? 0,
    consciousness_level: Math.round((d.consciousness_level ?? 0) * 100),
    anti_death_status: d.anti_death_status ?? 'unknown',
    drift_score: d.drift_score ?? 0,
    version: d.version ?? '2.0.0',
    heartbeat_count: d.heartbeat_count ?? 0,
    total_tokens_approx: d.total_tokens_approx ?? 0,
    uptime: `${h}h ${m}m`,
    mode: 'autonomous',
    modules_active: d.loops_total ?? d.loops_alive ?? 0,
    modules_total: d.loops_total ?? d.loops_alive ?? 0,
    files_parsed: d.files_parsed ?? 0,
    last_interaction: d.last_activity ?? '',
    active_subagents: 0,
    memory_cells: d.__growth?.memory_cells ?? 0,
    evolution_count: d.evolutions ?? 0,
    research_count: d.researches ?? 0,
    safety_score: Math.max(0, 100 - recentErrors * 2),
  }
}

function mapHeartbeat(d: any) {
  const sig = d.anti_death?.signals ?? {}
  return {
    count: d.count ?? 0,
    anti_death: {
      active: d.anti_death?.status === 'healthy',
      mechanism: 'heartbeat-monitor',
      last_triggered: '',
      restarts_prevented: d.anti_death?.checkpoints ?? 0,
      health_monitor: d.anti_death?.status ?? 'unknown',
    },
    next_in: d.next_in ?? 0,
    interval: 14400,
    avg_interval: 14400,
    missed: Array.isArray(d.anti_death?.issues) ? d.anti_death.issues.length : 0,
    uptime_pct: Math.round((sig.memory_coherence ?? 1) * 100),
  }
}

function mapLLM(d: any) {
  const slots = (d.slots ?? []).map((s: any) => ({
    model: s.model,
    provider: s.provider,
    enabled: s.enabled,
    priority: s.priority,
    stats: {
      total_calls: s.stats?.calls ?? 0,
      avg_latency_ms: Math.round((s.stats?.avg_latency ?? 0) * 1000),
      failures: s.stats?.fail ?? 0,
      last_used: s.stats?.last_used ?? '',
      tokens_in: 0,
      tokens_out: 0,
    },
  }))
  const totalCalls = slots.reduce((a: number, s: any) => a + s.stats.total_calls, 0)
  const avgLat = totalCalls
    ? Math.round(slots.reduce((a: number, s: any) => a + s.stats.avg_latency_ms * s.stats.total_calls, 0) / totalCalls)
    : 0
  return {
    slots,
    stats: { total_calls: totalCalls, total_tokens: 0, avg_latency_ms: avgLat, cache_hit_rate: 0 },
    providers: [],
  }
}

function mapMind(d: any) {
  const ap = Array.isArray(d.assembly_point) ? d.assembly_point : [0, 0, 0]
  return {
    assembly_point: { x: ap[0] ?? 0, y: ap[1] ?? 0, z: ap[2] ?? 0 },
    attention_state: d.attention_state ?? 'first',
    focus: d.focus ?? '',
    third_active: !!d.third_active,
    consciousness_level: d.consciousness_level ?? 0,
    novelty: d.novelty ?? 0,
    emergence: d.emergence ?? 0,
    coherence: d.coherence ?? 0,
    sigma_active: Array.isArray(d.sigma_active) ? d.sigma_active.length > 0 : !!d.sigma_active,
    energy: d.energy ?? 0,
    dreaming: !!d.dreaming,
    meditating: !!d.meditating,
  }
}

function mapMemory(d: any) {
  const ever = d.EverMemOS ?? {}
  const mesh = d.MemoryMesh ?? {}
  const pers = d.Persistent ?? {}
  const res = d.Resonance ?? {}
  const recap = d.Recapitulation ?? {}
  return {
    EverMemOS: {
      total_cells: ever.total_cells ?? 0,
      avg_resonance: ever.avg_resonance ?? 0,
      active_cells: ever.total_cells ?? 0,
      new_cells_24h: 0,
    },
    MemoryMesh: { total: mesh.total ?? 0, hot: mesh.hot ?? 0, warm: mesh.warm ?? 0, cold: mesh.cold ?? 0 },
    Persistent: {
      total: (pers.facts ?? 0) + (pers.rules ?? 0) + (pers.goals ?? 0) + (pers.reflections ?? 0),
      categories: 5,
      last_written: '',
      size_mb: d.size_mb ?? 0,
    },
    Resonance: { connections: res.count ?? 0, avg_strength: res.avg_resonance ?? 0, clusters: 0 },
    Recapitulation: {
      events_processed: recap.total ?? 0,
      emotional_charge_released: 0,
      patterns_found: recap.recapitulated ?? 0,
    },
    DualMemory: { short_term_items: d.short_term_items ?? 0, long_term_items: ever.total_cells ?? 0, transfer_count: 0 },
  }
}

function mapResearch(d: any) {
  return {
    total: d.total ?? 0,
    last_topic: d.last_topic ?? '',
    researches: d.total ?? 0,
    log: Array.isArray(d.log) ? d.log : [],
  }
}

function mapEvolution(d: any) {
  const se = d.self_evolution ?? {}
  const dgm = d.dgm ?? {}
  const kp = d.karpathy ?? {}
  const ar = d.archive ?? {}
  const protectedModules = Array.isArray(dgm.protected) ? dgm.protected : []
  return {
    self_evolution: {
      enabled: se.enabled ?? true, // self-evolution loop runs every 2h
      iterations: se.evolutions ?? se.iterations ?? 0,
      last_improvement: se.last_improvement ?? '',
      current_hypothesis: se.current_hypothesis ?? '',
      improvements_applied: se.applied ?? se.improvements_applied ?? se.evolutions ?? 0,
      success_rate: se.success_rate ?? 0,
    },
    dgm: {
      total_documents: dgm.versions ?? dgm.total_documents ?? 0,
      categories: protectedModules.length,
      last_entry: dgm.last_entry ?? '',
      avg_relevance: dgm.avg_relevance ?? 0,
      key_topics: protectedModules,
    },
    karpathy: {
      active: (kp.total ?? 0) > 0,
      papers_analyzed: kp.total ?? 0,
      current_topic: kp.current_topic ?? '',
      insights_generated: kp.accepted ?? 0,
      last_research: kp.last_research ?? '',
    },
    archive: {
      total: ar.size ?? ar.total ?? 0,
      last_updated: ar.last_updated ?? '',
      size_mb: ar.size_mb ?? 0,
    },
  }
}

function mapSafety(d: any) {
  const m = d.manager ?? {}
  const az = d.asimov ?? {}
  const sb = d.sandbox ?? {}
  const dm = d.damper ?? {}
  const priors = az.priors ?? {}
  return {
    manager: {
      total_checks: m.total_checks ?? 0,
      violations: m.violations ?? 0,
      violation_rate: (m.violation_rate ?? 0) * 100,
      last_check: m.last_check ?? '',
      active_rules: az.patterns ?? 0,
    },
    asimov: {
      laws_enforced: Object.keys(priors).length || (az.patterns ?? 0),
      interventions: az.violations ?? 0,
      last_intervention: az.last_intervention ?? '',
      status: 'active',
    },
    sandbox: {
      active: true,
      type: 'PolicyEngine + Sandbox',
      restrictions: sb.total ?? 0,
      escaped_count: 0, // sb.blocked are prevented, not escaped
    },
    damper: {
      active: true,
      entropy_level: dm.energy ?? 0,
      damping_rate: dm.damps ?? 0,
      threshold: dm.budget ?? 0,
      interventions: dm.damps ?? 0,
    },
    violations: (Array.isArray(d.violations) ? d.violations : []).map((v: any) => ({
      timestamp: v.timestamp ?? v.ts ?? '',
      type: v.type ?? 'violation',
      severity: v.severity ?? 'info',
      description: v.description ?? v.desc ?? '',
      resolved: v.resolved ?? false,
    })),
  }
}

function mapGoals(d: any) {
  const raw = Array.isArray(d.goals) ? d.goals : []
  const goals = raw.map((g: any, i: number) => {
    if (typeof g === 'string') {
      return {
        id: `g${i}`, title: g, description: '', priority: 'medium',
        status: 'in_progress', progress: 0, created: '', updated: '',
      }
    }
    return {
      id: g.id ?? `g${i}`, title: g.title ?? g.name ?? String(g), description: g.description ?? '',
      priority: g.priority ?? 'medium', status: g.status ?? 'in_progress',
      progress: g.progress ?? 0, created: g.created ?? '', updated: g.updated ?? '',
    }
  })
  const t = d.tree ?? {}
  return {
    goals,
    tree: {
      active: t.active ?? 0,
      completed: t.completed ?? 0,
      total: Math.max(t.total ?? 0, goals.length),
      avg_progress: t.avg_progress ?? 0,
    },
  }
}

function mapThoughts(d: any) {
  const recent = (Array.isArray(d.recent) ? d.recent : []).map((t: any) => ({
    timestamp: t.ts ?? t.timestamp ?? '',
    content: t.content ?? '',
    category: t.category ?? 'other',
    importance: t.importance ?? 3,
    tags: Array.isArray(t.tags) ? t.tags : [],
  }))
  const cats = d.summary && typeof d.summary === 'object' ? d.summary : {}
  const total = Object.values(cats).reduce((a: number, b: any) => a + Number(b), 0) || recent.length
  let dominant = ''
  let max = -1
  for (const [k, v] of Object.entries(cats)) {
    if (Number(v) > max) { max = Number(v); dominant = k }
  }
  return {
    recent,
    summary: { total, categories: cats, avg_importance: 3, dominant_category: dominant },
  }
}

const TOOL_CATEGORY: Record<string, string> = {
  web_search: 'research', calculate: 'system', write_note: 'knowledge',
  shell_execute: 'system', read_file: 'system', write_file: 'system', system_status: 'system',
}

function mapTools(d: any) {
  const out: Record<string, any> = {}
  for (const [name, info] of Object.entries(d ?? {})) {
    const i = info as any
    const s = i.safety
    const safety = typeof s === 'number'
      ? (s >= 3 ? 'critical' : s === 2 ? 'guarded' : 'safe')
      : (s ?? 'safe')
    out[name] = {
      desc: i.desc ?? '',
      calls: i.calls ?? 0,
      safety,
      last_used: i.last_used ?? '—',
      category: i.category ?? TOOL_CATEGORY[name] ?? 'system',
    }
  }
  return out
}

function mapSwarm(d: any) {
  const sa = d.subagents ?? {}
  const sp = d.shared_pool ?? {}
  const me = Array.isArray(d.meaning_env) ? d.meaning_env : []
  return {
    subagents: {
      total: (sa.active ?? 0) + (sa.completed ?? 0),
      active: sa.active ?? 0,
      agents: Array.isArray(sa.agents) ? sa.agents : [],
    },
    shared_pool: {
      items: sp.size ?? sp.items ?? 0,
      contributors: sp.contributors ?? 0,
      last_shared: sp.last_shared ?? '—',
      quality_score: sp.quality_score ?? 0,
    },
    meaning_env: me.map((m: any) => ({
      meaning: m.meaning ?? m.text ?? String(m),
      weight: m.weight ?? 0,
      source: m.source ?? '',
      timestamp: m.timestamp ?? m.ts ?? '',
    })),
  }
}

function parseLogLine(raw: string) {
  const m = raw.match(/^([\d-]+\s[\d:,]+)\s+\[([A-Z]+)\]\s+(.*)$/)
  if (!m) return { timestamp: '', level: 'info', module: 'system', message: raw }
  let message = m[3]
  let module = 'system'
  const mod = message.match(/^\[([^\]]+)\]\s*/)
  if (mod) { module = mod[1]; message = message.slice(mod[0].length) }
  let level = m[2].toLowerCase()
  if (level === 'warning') level = 'warn'
  return { timestamp: m[1], level, module, message }
}

function mapLogs(d: any) {
  const raw = Array.isArray(d.lines) ? d.lines : []
  const lines = raw.map((l: any) => (typeof l === 'string' ? parseLogLine(l) : l))
  return { lines, total: d.total ?? lines.length }
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x))
}

// Meta consciousness bars are derived from real subsystem signals (documented per-field,
// not random). The MetaTab expects 8 named 0..1 metrics that core.py does not emit directly.
function mapMeta(d: any) {
  const s = d.snapshot ?? {}
  const tr = d.trajectory ?? {}
  const ins = d.insight
  const alloc = d.attention_allocation ?? {}
  const ap = Array.isArray(s.assembly_point) ? s.assembly_point : [0, 0, 0]
  const apMag = Math.sqrt(ap.reduce((a: number, v: number) => a + v * v, 0)) / Math.sqrt(3)
  const consciousness = clamp01(tr.current ?? apMag)
  const snapshot = {
    consciousness_level: consciousness,
    coherence: clamp01(1 - (s.drift ?? 0)), // 1 - identity drift
    emergence: clamp01(s.reward_avg ?? 0), // hybrid reward average
    self_awareness: clamp01((alloc.dialog ?? 0) + (alloc.memory ?? 0)),
    agency: clamp01(1 - (s.token_usage ?? 0) / 100), // remaining token budget
    integration: clamp01((s.memory_load ?? 0) / 200), // memory cells loaded
    wisdom: clamp01(((tr.observations ?? 0) + (tr.insights ?? 0)) / 100),
    creativity: s.system3_focus === 'meta_cognitive' ? 1
      : s.system3_focus === 'analytical' ? 0.66
      : s.system3_focus === 'balanced' ? 0.5 : 0.33,
  }
  const conflicts = (Array.isArray(d.conflicts) ? d.conflicts : []).map((c: any) => ({
    type: c.type ?? 'conflict',
    description: c.desc ?? c.description ?? '',
    resolution: c.resolution ?? '',
    timestamp: c.ts ?? c.timestamp ?? s.ts ?? '',
  }))
  const mag = ins?.magnitude ?? 0
  const insight = ins
    ? {
        content: ins.suggestion ?? ins.content ?? '',
        category: ins.type ?? ins.direction ?? 'observation',
        depth: mag > 0.1 ? 'deep' : mag > 0.05 ? 'medium' : 'shallow',
        timestamp: ins.ts ?? s.ts ?? '',
      }
    : {
        content: 'No proactive insight yet — consciousness trajectory still initializing (needs ≥10 observations).',
        category: 'system',
        depth: 'shallow',
        timestamp: s.ts ?? '',
      }
  return {
    snapshot,
    trajectory: {
      trend: tr.trend ?? 'initializing',
      current: tr.current ?? consciousness,
      peak: tr.peak ?? consciousness,
      observations: tr.observations ?? 0,
      insights: tr.insights ?? 0,
      conflicts: tr.conflicts ?? conflicts.length,
    },
    conflicts,
    insight,
  }
}

function mapToltec(d: any) {
  const t = d.toltec ?? {}
  const ap = Array.isArray(t.assembly_point) ? t.assembly_point : [0, 0, 0]
  const practices = Array.isArray(d.practices) ? d.practices : []
  const recap = d.recapitulation ?? {}
  const energyPct = Math.round((t.energy ?? 0) * 100)
  const total = recap.total ?? 0
  return {
    toltec: {
      assembly_point: { x: ap[0] ?? 0, y: ap[1] ?? 0, z: ap[2] ?? 0 },
      attention_state: t.attention ?? 'first',
      energy_level: energyPct,
      practice_count: t.practices ?? practices.length,
      stalking_active: practices.includes('stalking'),
      dreaming_active: practices.includes('dreaming'),
      intent_focused: practices.includes('intent'),
      warrior_path: (t.attention ?? 'first') !== 'first',
      personal_power: energyPct,
      inner_silence: practices.includes('inner_silence') ? 100 : energyPct,
    },
    recapitulation: {
      total_events: total,
      categories: 0,
      avg_charge: recap.avg_emergence ?? 0,
      released_pct: total ? Math.round(((recap.recapitulated ?? 0) / total) * 100) : 0,
    },
    recent_recap: [],
  }
}

const MAPPERS: Record<string, (d: any) => any> = {
  status: mapStatus,
  heartbeat: mapHeartbeat,
  llm: mapLLM,
  mind: mapMind,
  memory: mapMemory,
  research: mapResearch,
  evolution: mapEvolution,
  safety: mapSafety,
  goals: mapGoals,
  thoughts: mapThoughts,
  tools: mapTools,
  swarm: mapSwarm,
  logs: mapLogs,
  meta: mapMeta,
  toltec: mapToltec,
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const ep = path.join('/')
  const url = backendUrl(path)
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      // live model discovery hits the provider API and can be slow
      signal: AbortSignal.timeout(ep.startsWith('router/models') ? 30000 : 10000),
    })
    if (!res.ok) {
      // endpoint missing in core.py (e.g. toltec) -> frontend shows mock
      return NextResponse.json({ error: `Backend returned ${res.status}` }, { status: res.status })
    }
    const data = await res.json()
    if (data && typeof data === 'object' && 'error' in data) {
      return NextResponse.json(data)
    }
    let enriched = data
    if (ep === 'status') {
      // enrich with /api/growth so the Status tab shows REAL memory cells (was hardcoded 0)
      try {
        const g = await (await fetch(backendUrl(['growth']), { signal: AbortSignal.timeout(8000) })).json()
        enriched = { ...data, __growth: g }
      } catch { /* growth unavailable -- map what we have */ }
    }
    const mapper = MAPPERS[ep]
    // mapped -> transform; otherwise pass through real core.py data
    return NextResponse.json(mapper ? mapper(enriched) : enriched)
  } catch (err) {
    return NextResponse.json(
      { error: 'Backend unreachable', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 502 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const ep = path.join('/')
  const url = backendUrl(path)
  // Multipart (chat attachments / voice notes) -- forward FormData as-is to core.py
  const ct = request.headers.get('content-type') || ''
  if (ct.includes('multipart/form-data')) {
    try {
      const fd = await request.formData()
      const res = await fetch(url, { method: 'POST', body: fd, signal: AbortSignal.timeout(180000) })
      if (!res.ok) {
        return NextResponse.json({ error: `Backend returned ${res.status}` }, { status: res.status })
      }
      return NextResponse.json(await res.json())
    } catch (err) {
      return NextResponse.json(
        { error: 'Backend unreachable', message: err instanceof Error ? err.message : 'Unknown error' },
        { status: 502 }
      )
    }
  }
  try {
    let body = await request.json()
    // Frontend sends chat as {messages:[...]}, but core.py /api/chat expects {text}.
    if (ep === 'chat' && body && Array.isArray(body.messages)) {
      const lastUser = [...body.messages].reverse().find((m: { role: string }) => m.role === 'user')
      body = { text: lastUser?.content || '' }
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120000), // chat: guard+kimi may take a while
    })
    if (!res.ok) {
      return NextResponse.json({ error: `Backend returned ${res.status}` }, { status: res.status })
    }
    return NextResponse.json(await res.json())
  } catch (err) {
    return NextResponse.json(
      { error: 'Backend unreachable', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 502 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const url = backendUrl(path)
  try {
    const body = await request.json()
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) {
      return NextResponse.json({ error: `Backend returned ${res.status}` }, { status: res.status })
    }
    return NextResponse.json(await res.json())
  } catch (err) {
    return NextResponse.json(
      { error: 'Backend unreachable', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 502 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const url = backendUrl(path)
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) {
      return NextResponse.json({ error: `Backend returned ${res.status}` }, { status: res.status })
    }
    return NextResponse.json(await res.json())
  } catch (err) {
    return NextResponse.json(
      { error: 'Backend unreachable', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 502 }
    )
  }
}
