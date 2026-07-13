'use client'

import { motion } from 'framer-motion'
import { Brain, TrendingUp, TrendingDown, Eye, Lightbulb, AlertTriangle, Sparkles, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMeta } from '@/hooks/useNagualAPI'
import { useT } from '@/lib/i18n'

function GradientProgress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-primary/20 ${className || ''}`}>
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-nagual-purple to-nagual-cyan"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  )
}

function SnapshotBar({
  label,
  value,
  delay = 0,
}: {
  label: string
  value: number
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center gap-3"
    >
      <span className="text-xs text-muted-foreground min-w-[120px] text-right">{label}</span>
      <div className="flex-1">
        <GradientProgress value={value} />
      </div>
      <span className="text-xs font-mono font-bold min-w-[36px]">{(value * 100).toFixed(0)}</span>
    </motion.div>
  )
}

function ConflictTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    value_conflict: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30',
    goal_conflict: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30',
    identity_conflict: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30',
    priority_conflict: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  }
  return (
    <Badge className={`text-[10px] capitalize ${colors[type] || 'bg-muted text-muted-foreground border-border'}`}>
      {type.replace(/_/g, ' ')}
    </Badge>
  )
}

function DepthBadge({ depth }: { depth: string }) {
  const t = useT()
  switch (depth) {
    case 'deep':
      return (
        <Badge className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white border-0">
          {t('meta.deep')}
        </Badge>
      )
    case 'medium':
      return (
        <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30">
          {t('meta.medium')}
        </Badge>
      )
    case 'shallow':
      return (
        <Badge className="bg-muted text-muted-foreground border-border">
          {t('meta.shallow')}
        </Badge>
      )
    default:
      return <Badge variant="outline">{depth}</Badge>
  }
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export function MetaTab() {
  const { data, isLoading } = useMeta()
  const t = useT()

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-48 rounded-xl border border-border bg-card animate-pulse" />
          <div className="h-48 rounded-xl border border-border bg-card animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-48 rounded-xl border border-border bg-card animate-pulse" />
          <div className="h-48 rounded-xl border border-border bg-card animate-pulse" />
        </div>
      </div>
    )
  }

  const { snapshot, trajectory, conflicts, insight } = data

  return (
    <div className="space-y-6">
      {/* Trajectory + Snapshot Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trajectory Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="hover:border-nagual-purple/30 transition-all duration-300 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="w-4 h-4 text-nagual-purple" />
                {t('meta.trajectory')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t('meta.trend')}</span>
                {trajectory.trend === 'ascending' ? (
                  <Badge className="bg-nagual-green/10 text-nagual-green border-nagual-green/20">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {t('meta.ascending')}
                  </Badge>
                ) : trajectory.trend === 'descending' ? (
                  <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    {t('meta.descending')}
                  </Badge>
                ) : (
                  <Badge variant="outline">{t('meta.stable')}</Badge>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-nagual-purple/5 border border-nagual-purple/10">
                  <p className="text-2xl font-bold font-mono text-nagual-purple">
                    {trajectory.current.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">{t('meta.currentLevel')}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-nagual-cyan/5 border border-nagual-cyan/10">
                  <p className="text-2xl font-bold font-mono text-nagual-cyan">
                    {trajectory.peak.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">{t('meta.peakLevel')}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold font-mono">{trajectory.observations}</p>
                  <p className="text-[10px] text-muted-foreground">{t('meta.observations')}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold font-mono">{trajectory.insights}</p>
                  <p className="text-[10px] text-muted-foreground">{t('meta.insights')}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold font-mono text-nagual-red">{trajectory.conflicts}</p>
                  <p className="text-[10px] text-muted-foreground">{t('meta.conflicts')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Snapshot Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="hover:border-nagual-purple/30 transition-all duration-300 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="w-4 h-4 text-nagual-cyan" />
                {t('meta.snapshot')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <SnapshotBar label={t('meta.consciousness')} value={snapshot.consciousness_level} delay={0.0} />
                <SnapshotBar label={t('meta.coherence')} value={snapshot.coherence} delay={0.05} />
                <SnapshotBar label={t('meta.emergence')} value={snapshot.emergence} delay={0.1} />
                <SnapshotBar label={t('meta.selfAwareness')} value={snapshot.self_awareness} delay={0.15} />
                <SnapshotBar label={t('meta.agency')} value={snapshot.agency} delay={0.2} />
                <SnapshotBar label={t('meta.integration')} value={snapshot.integration} delay={0.25} />
                <SnapshotBar label={t('meta.wisdom')} value={snapshot.wisdom} delay={0.3} />
                <SnapshotBar label={t('meta.creativity')} value={snapshot.creativity} delay={0.35} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Proactive Insight Card (Prominent) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="hover:border-nagual-purple/30 transition-all duration-300 overflow-hidden relative">
          {/* Gradient accent at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-nagual-purple to-nagual-cyan" />
          <CardHeader className="pb-2 pt-5">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="w-4 h-4 text-nagual-purple" />
              {t('meta.proactiveInsight')}
              <div className="ml-auto flex items-center gap-2">
                <DepthBadge depth={insight.depth} />
                <Badge variant="outline" className="text-[10px] capitalize">{insight.category}</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed bg-muted/30 rounded-lg p-4 border border-border">
              {insight.content}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Eye className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-mono">{insight.timestamp}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Conflicts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="hover:border-nagual-purple/30 transition-all duration-300 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="w-4 h-4 text-nagual-red" />
                {t('meta.conflicts')}
                <Badge variant="outline" className="ml-auto">{conflicts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[320px] pr-4">
                {conflicts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">{t('meta.noConflicts')}</p>
                  </div>
                ) : (
                  <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-3"
                  >
                    {conflicts.map((conflict, idx) => (
                      <motion.div
                        key={idx}
                        variants={item}
                        className="rounded-lg border border-border p-4 hover:border-nagual-purple/30 transition-all duration-200 bg-card"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <ConflictTypeBadge type={conflict.type} />
                          <span className="text-[10px] text-muted-foreground font-mono ml-auto">
                            {conflict.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-foreground mb-2 font-medium">
                          {conflict.description}
                        </p>
                        {conflict.resolution && (
                          <div className="rounded-md bg-nagual-green/5 border border-nagual-green/10 p-2">
                            <p className="text-[10px] text-muted-foreground font-medium mb-0.5">{t('meta.resolution')}</p>
                            <p className="text-xs text-foreground">{conflict.resolution}</p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Insight Detail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="hover:border-nagual-purple/30 transition-all duration-300 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="w-4 h-4 text-nagual-purple" />
                {t('meta.insightDetail')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-nagual-purple/5 border border-nagual-purple/10">
                  <p className="text-sm font-bold capitalize text-nagual-purple">{insight.category}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{t('meta.category')}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-nagual-cyan/5 border border-nagual-cyan/10">
                  <DepthBadge depth={insight.depth} />
                  <p className="text-[10px] text-muted-foreground mt-1">{t('meta.depth')}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Eye className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t('meta.recordedAt')}</span>
                </div>
                <p className="text-sm font-mono">{insight.timestamp}</p>
              </div>

              <Separator />

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t('meta.content')}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{insight.content}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold font-mono">{trajectory.observations}</p>
                  <p className="text-[10px] text-muted-foreground">{t('meta.totalObservations')}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold font-mono">{trajectory.insights}</p>
                  <p className="text-[10px] text-muted-foreground">{t('meta.totalInsights')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
