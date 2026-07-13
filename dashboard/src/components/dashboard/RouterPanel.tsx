'use client'

// Atlas Router control panel: live key pool + priority slots + model discovery + pin-to-primary.
// Talks directly to /api/nagual/router/* (proxied to core.py). No restart needed — everything is live.
import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { KeyRound, Plus, Trash2, Pin, RefreshCw, Server } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useT } from '@/lib/i18n'

const BASE = '/api/nagual/router'

const PROVIDERS = ['openrouter', 'nvidia', 'google', 'anthropic', 'openai', 'xai', 'deepseek', 'moonshot', 'mimo']

interface Key { id: string; provider: string; label: string; value: string; added_at: string }
interface Slot {
  model: string; provider: string; enabled: boolean; priority: number
  key_id: string | null; cooldown: number; stats: { total_calls?: number; calls?: number }
}

export default function RouterPanel() {
  const t = useT()
  const [keys, setKeys] = useState<Key[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [models, setModels] = useState<Record<string, string[]>>({})
  const [discovering, setDiscovering] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  // add-key form
  const [nkProvider, setNkProvider] = useState('openrouter')
  const [nkLabel, setNkLabel] = useState('')
  const [nkValue, setNkValue] = useState('')
  // add-slot form
  const [nsKey, setNsKey] = useState('')
  const [nsModel, setNsModel] = useState('')

  const loadKeys = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/keys`)
      const d = await r.json()
      setKeys(Array.isArray(d.keys) ? d.keys : [])
    } catch { /* backend down */ }
  }, [])

  const loadSlots = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/slots`)
      const d = await r.json()
      setSlots(Array.isArray(d.slots) ? d.slots : [])
    } catch { /* backend down */ }
  }, [])

  useEffect(() => { loadKeys(); loadSlots() }, [loadKeys, loadSlots])

  const discover = useCallback(async (keyId: string) => {
    if (!keyId) return
    setDiscovering(keyId)
    try {
      const r = await fetch(`${BASE}/models?key_id=${encodeURIComponent(keyId)}`)
      const d = await r.json()
      setModels((m) => ({ ...m, [keyId]: Array.isArray(d.models) ? d.models : [] }))
    } catch { /* ignore */ } finally { setDiscovering(null) }
  }, [])

  const addKey = async () => {
    if (!nkValue.trim() || busy) return
    setBusy(true)
    try {
      await fetch(`${BASE}/keys`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: nkProvider, label: nkLabel, value: nkValue.trim() }),
      })
      setNkLabel(''); setNkValue('')
      await loadKeys()
    } finally { setBusy(false) }
  }

  const removeKey = async (id: string) => {
    setBusy(true)
    try { await fetch(`${BASE}/keys/${id}`, { method: 'DELETE' }); await loadKeys(); await loadSlots() }
    finally { setBusy(false) }
  }

  const applySlots = (d: { slots?: Slot[] }) => { if (Array.isArray(d.slots)) setSlots(d.slots) }

  const addSlot = async () => {
    if (!nsKey || !nsModel.trim() || busy) return
    setBusy(true)
    try {
      const r = await fetch(`${BASE}/slots`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key_id: nsKey, model_id: nsModel.trim() }),
      })
      applySlots(await r.json()); setNsModel('')
    } finally { setBusy(false) }
  }

  const updateSlot = async (index: number, patch: Record<string, unknown>) => {
    setBusy(true)
    try {
      const r = await fetch(`${BASE}/slots/${index}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch),
      })
      applySlots(await r.json())
    } finally { setBusy(false) }
  }

  const pinSlot = async (index: number) => {
    setBusy(true)
    try { const r = await fetch(`${BASE}/slots/${index}/pin`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }); applySlots(await r.json()) }
    finally { setBusy(false) }
  }

  const removeSlot = async (index: number) => {
    setBusy(true)
    try { const r = await fetch(`${BASE}/slots/${index}`, { method: 'DELETE' }); applySlots(await r.json()) }
    finally { setBusy(false) }
  }

  const keyLabel = (k: Key) => `${k.provider} · ${k.label || k.id}`

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold gradient-text">{t('router.title')}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{t('router.subtitle')}</p>
      </div>

      {/* ── Key pool ── */}
      <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#7C3AED]/10 to-[#06B6D4]/10">
              <KeyRound className="h-4 w-4 text-[#7C3AED]" />
            </div>
            {t('router.keysTitle')}
            <Badge variant="outline" className="ml-auto">{keys.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {keys.length === 0 && (
            <p className="text-xs text-muted-foreground">{t('router.noKeys')}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {keys.map((k) => (
              <div key={k.id} className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                <Badge className="bg-[#7C3AED]/15 text-[#7C3AED] dark:text-[#a78bfa] border-[#7C3AED]/30 text-[10px]">{k.provider}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{k.label || k.id}</p>
                  <p className="text-[10px] font-mono text-muted-foreground truncate">{k.value}</p>
                </div>
                <button onClick={() => removeKey(k.id)} disabled={busy}
                  className="p-1 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          {/* add key form */}
          <div className="flex flex-wrap items-end gap-2 pt-2 border-t border-border">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('router.provider')}</label>
              <select value={nkProvider} onChange={(e) => setNkProvider(e.target.value)}
                className="h-8 rounded-md border border-border bg-background px-2 text-xs">
                {PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('router.label')}</label>
              <input value={nkLabel} onChange={(e) => setNkLabel(e.target.value)}
                className="h-8 rounded-md border border-border bg-background px-2 text-xs w-32" />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('router.value')}</label>
              <input value={nkValue} onChange={(e) => setNkValue(e.target.value)} type="password" placeholder="sk-..."
                className="h-8 rounded-md border border-border bg-background px-2 text-xs font-mono" />
            </div>
            <button onClick={addKey} disabled={busy || !nkValue.trim()}
              className="h-8 inline-flex items-center gap-1 px-3 rounded-md bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white text-xs font-medium disabled:opacity-50">
              <Plus className="h-3.5 w-3.5" /> {t('router.add')}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ── Slots ── */}
      <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#7C3AED]/10 to-[#06B6D4]/10">
              <Server className="h-4 w-4 text-[#7C3AED]" />
            </div>
            {t('router.slotsTitle')}
            <Badge variant="outline" className="ml-auto">{slots.length}</Badge>
          </CardTitle>
          <p className="text-[10px] text-muted-foreground mt-1">{t('router.slotsHint')}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {slots.length === 0 && <p className="text-xs text-muted-foreground">{t('router.noSlots')}</p>}
          {slots.map((s) => {
            const modelList = s.key_id ? models[s.key_id] || [] : []
            return (
              <motion.div key={s.priority} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg border p-3 ${s.priority === 0 ? 'border-[#7C3AED]/50 bg-[#7C3AED]/5' : 'border-border bg-muted/20'} ${!s.enabled ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className={s.priority === 0
                    ? 'bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white border-0 text-[10px]'
                    : 'bg-muted text-muted-foreground border-border text-[10px]'}>
                    {s.priority === 0 ? t('router.primary') : `${t('router.fallback')}-${s.priority}`}
                  </Badge>
                  <span className="text-sm font-semibold font-mono truncate">{s.model || '—'}</span>
                  {s.cooldown > 0 && (
                    <Badge className="bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30 text-[10px]">
                      {t('router.cooldown')} {s.cooldown}s
                    </Badge>
                  )}
                  <span className="ml-auto text-[10px] text-muted-foreground font-mono">
                    {(s.stats?.total_calls ?? s.stats?.calls ?? 0)} {t('router.calls')}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* key select */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('router.key')}</label>
                    <select value={s.key_id || ''} disabled={busy}
                      onChange={(e) => { updateSlot(s.priority, { key_id: e.target.value }); discover(e.target.value) }}
                      className="h-8 rounded-md border border-border bg-background px-2 text-xs">
                      <option value="" disabled>—</option>
                      {keys.map((k) => <option key={k.id} value={k.id}>{keyLabel(k)}</option>)}
                    </select>
                  </div>
                  {/* model select + manual */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      {t('router.model')}
                      <button onClick={() => s.key_id && discover(s.key_id)} disabled={!s.key_id || discovering === s.key_id}
                        className="ml-auto inline-flex items-center gap-1 text-[#06B6D4] hover:underline">
                        <RefreshCw className={`h-3 w-3 ${discovering === s.key_id ? 'animate-spin' : ''}`} />
                        {discovering === s.key_id ? t('router.discovering') : t('router.refresh')}
                      </button>
                    </label>
                    <select value={modelList.includes(s.model) ? s.model : ''} disabled={busy}
                      onChange={(e) => e.target.value && updateSlot(s.priority, { model_id: e.target.value })}
                      className="h-8 rounded-md border border-border bg-background px-2 text-xs">
                      <option value="">{t('router.selectModel')}</option>
                      {modelList.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <input defaultValue={s.model} placeholder={t('router.manualModel')}
                  onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== s.model) updateSlot(s.priority, { model_id: v }) }}
                  className="mt-2 h-7 w-full rounded-md border border-border bg-background px-2 text-xs font-mono" />
                {/* actions */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                    <input type="checkbox" checked={s.enabled} disabled={busy}
                      onChange={(e) => updateSlot(s.priority, { enabled: e.target.checked })} />
                    {t('router.enabled')}
                  </label>
                  {s.priority !== 0 && (
                    <button onClick={() => pinSlot(s.priority)} disabled={busy}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#7C3AED]/40 text-[#7C3AED] dark:text-[#a78bfa] hover:bg-[#7C3AED]/10 text-xs font-medium">
                      <Pin className="h-3 w-3" /> {t('router.pin')}
                    </button>
                  )}
                  <button onClick={() => removeSlot(s.priority)} disabled={busy}
                    className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 text-xs">
                    <Trash2 className="h-3 w-3" /> {t('router.remove')}
                  </button>
                </div>
              </motion.div>
            )
          })}

          {/* add slot */}
          <div className="flex flex-wrap items-end gap-2 pt-3 border-t border-border">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('router.key')}</label>
              <select value={nsKey} onChange={(e) => { setNsKey(e.target.value); discover(e.target.value) }}
                className="h-8 rounded-md border border-border bg-background px-2 text-xs">
                <option value="" disabled>—</option>
                {keys.map((k) => <option key={k.id} value={k.id}>{keyLabel(k)}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('router.model')}</label>
              <input value={nsModel} onChange={(e) => setNsModel(e.target.value)} list="ns-models"
                placeholder={t('router.selectModel')}
                className="h-8 rounded-md border border-border bg-background px-2 text-xs font-mono" />
              <datalist id="ns-models">
                {(nsKey ? models[nsKey] || [] : []).map((m) => <option key={m} value={m} />)}
              </datalist>
            </div>
            <button onClick={addSlot} disabled={busy || !nsKey || !nsModel.trim()}
              className="h-8 inline-flex items-center gap-1 px-3 rounded-md bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white text-xs font-medium disabled:opacity-50">
              <Plus className="h-3.5 w-3.5" /> {t('router.addSlot')}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
