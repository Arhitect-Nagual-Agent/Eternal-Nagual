'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FlaskConical, TrendingUp, TrendingDown, Activity, Scale } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface KarpathyExperiment {
  hypothesis: string
  ts: string
  status: string
  result: number | null
}
interface KarpathyDecision {
  ts: string
  kept: boolean
  msg: string
}
interface FitnessParts {
  quality: number
  growth: number
  diversity: number
  stability: number
  total: number
}
interface KarpathyData {
  stats: { total: number; accepted: number }
  reward_weights: Record<string, number>
  fitness: number
  fitness_parts?: FitnessParts
  cycle_seconds: number
  experiments: KarpathyExperiment[]
  decisions: KarpathyDecision[]
  running: boolean
}

async function fetchKarpathy(): Promise<KarpathyData> {
  const res = await fetch('/api/nagual/karpathy', { cache: 'no-store' })
  if (!res.ok) throw new Error('karpathy fetch failed')
  return res.json()
}

export function KarpathyTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['nagual', 'karpathy'],
    queryFn: fetchKarpathy,
    refetchInterval: 10_000,
    staleTime: 5_000,
  })

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
        <div className="h-96 rounded-xl border border-border bg-card animate-pulse" />
      </div>
    )
  }

  const weights = Object.entries(data.reward_weights || {})

  const stat = (icon: React.ReactNode, label: string, value: string) => (
    <Card className="hover:border-nagual-purple/30 transition-all duration-300">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-nagual-purple/10 to-nagual-cyan/10">{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold font-mono">{value}</p>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {stat(<Activity className="w-5 h-5 text-nagual-purple" />, 'Самооценка', data.fitness.toFixed(3))}
        {stat(<FlaskConical className="w-5 h-5 text-nagual-cyan" />, 'Experiments', String(data.stats.total))}
        {stat(<TrendingUp className="w-5 h-5 text-nagual-green" />, 'Accepted', String(data.stats.accepted))}
        {stat(<Scale className="w-5 h-5 text-nagual-purple" />, 'Cycle', `${data.cycle_seconds}s`)}
      </motion.div>

      {data.fitness_parts && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.04 }}>
          <Card className="hover:border-nagual-purple/30 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="w-4 h-4 text-nagual-purple" />
                Из чего складывается Самооценка
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(
                [
                  ['Качество ответов', data.fitness_parts.quality, 'насколько хороши ответы (вес 40%)'],
                  ['Рост мастерства', data.fitness_parts.growth, 'становится ли лучше со временем (вес 25%)'],
                  ['Разнообразие', data.fitness_parts.diversity, 'живёт широко или долбит одно (вес 20%)'],
                  ['Стабильность', data.fitness_parts.stability, 'не дрейфует от себя (вес 15%)'],
                ] as [string, number, string][]
              ).map(([label, val, hint]) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">
                      {label} <span className="text-muted-foreground font-normal">— {hint}</span>
                    </span>
                    <span className="font-mono">{val.toFixed(2)}</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-nagual-purple to-nagual-cyan"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, val * 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-muted-foreground pt-1">
                Самооценка = 0.40·качество + 0.25·рост + 0.20·разнообразие + 0.15·стабильность. Самый низкий
                компонент — туда Карпати-лупу и расти.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Scale className="w-4 h-4 text-nagual-purple" />
              Reward Weights — что крутит луп (Tweak)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weights.length === 0 ? (
              <p className="text-sm text-muted-foreground">нет весов</p>
            ) : (
              weights.map(([k, v]) => (
                <div key={k}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{k}</span>
                    <span className="font-mono">{(v as number).toFixed(3)}</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-nagual-purple to-nagual-cyan"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (v as number) * 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FlaskConical className="w-4 h-4 text-nagual-purple" />
              Keep / Discard — решения лупа (Measure)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {!data.decisions || data.decisions.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">Пока нет решений — луп ещё мутирует</div>
              ) : (
                <div className="space-y-2">
                  {data.decisions.map((d, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border border-border p-3 bg-white">
                      {d.kept ? (
                        <TrendingUp className="w-4 h-4 text-nagual-green mt-0.5 flex-shrink-0" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <Badge className={d.kept ? 'bg-nagual-green/15 text-nagual-green border-0' : 'bg-red-100 text-red-600 border-0'}>
                          {d.kept ? 'KEEP' : 'DISCARD'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1 break-words">{d.msg}</p>
                        <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">{d.ts}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="w-4 h-4 text-nagual-purple" />
              Эксперименты — Read → Tweak → Measure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px] pr-4">
              {data.experiments.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">нет экспериментов</div>
              ) : (
                <div className="space-y-2">
                  {data.experiments.map((e, i) => (
                    <div key={i} className="rounded-lg border border-border p-3 bg-white">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium break-words">{e.hypothesis}</span>
                        <Badge variant="outline" className="flex-shrink-0">{e.status}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground/60 font-mono">
                        <span>Δ={e.result === null ? '—' : e.result}</span>
                        <span>{e.ts}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default KarpathyTab
