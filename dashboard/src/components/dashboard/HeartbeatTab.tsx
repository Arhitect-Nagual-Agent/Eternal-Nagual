'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Shield, Clock, Activity, TrendingUp, Timer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useHeartbeat } from '@/hooks/useNagualAPI'
import { useT } from '@/lib/i18n'

function GradientProgress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-primary/20 ${className || ''}`}>
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-nagual-purple to-nagual-cyan"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  )
}

export function HeartbeatTab() {
  const { data, isLoading } = useHeartbeat()
  const t = useT()
  const nextIn = data?.next_in ?? 0

  const [prevNextIn, setPrevNextIn] = useState(0)
  const [countdown, setCountdown] = useState(0)

  if (nextIn !== prevNextIn && nextIn > 0 && (nextIn > countdown || prevNextIn === 0)) {
    setPrevNextIn(nextIn)
    setCountdown(nextIn)
  }

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-xl border border-border bg-card animate-pulse" />
        ))}
      </div>
    )
  }

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Big Heartbeat Count */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-nagual-purple/10 to-nagual-cyan/10">
                <Heart className="w-8 h-8 text-nagual-purple" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('hb.totalHeartbeats')}
                </p>
                <p className="text-5xl font-bold font-mono text-foreground mt-1">
                  {data.count.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-nagual-cyan" />
                <span className="text-xs text-muted-foreground">{t('hb.nextIn')}</span>
              </div>
              <p className="text-3xl font-bold font-mono text-nagual-cyan">
                {formatCountdown(countdown)}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Anti-Death Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="hover:border-nagual-purple/30 transition-all duration-300 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="w-4 h-4 text-nagual-purple" />
                {t('hb.antiDeath')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('common.status')}</span>
                {data.anti_death.active ? (
                  <Badge className="bg-nagual-green/10 text-nagual-green border-nagual-green/20">
                    {t('common.active')}
                  </Badge>
                ) : (
                  <Badge variant="destructive">{t('common.inactive')}</Badge>
                )}
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('hb.mechanism')}</span>
                  <span className="text-sm font-mono font-medium">{data.anti_death.mechanism}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('hb.lastTriggered')}</span>
                  <span className="text-sm font-mono">{data.anti_death.last_triggered || t('common.na')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('hb.restartsPrevented')}</span>
                  <span className="text-sm font-mono font-bold text-nagual-green">
                    {data.anti_death.restarts_prevented}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('hb.healthMonitor')}</span>
                  <StatusBadge
                    status={data.anti_death.health_monitor === 'healthy' ? 'healthy' : 'warning'}
                    label={data.anti_death.health_monitor}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Timing Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="hover:border-nagual-purple/30 transition-all duration-300 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-4 h-4 text-nagual-cyan" />
                {t('hb.timingMetrics')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('hb.interval')}</span>
                  <span className="text-sm font-mono font-medium">{data.interval}s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('hb.avgInterval')}</span>
                  <span className="text-sm font-mono font-medium">{data.avg_interval.toFixed(1)}s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('hb.missedBeats')}</span>
                  <span className={`text-sm font-mono font-bold ${data.missed > 0 ? 'text-nagual-red' : 'text-nagual-green'}`}>
                    {data.missed}
                  </span>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('hb.uptime')}</span>
                  <span className="text-sm font-mono font-bold">{data.uptime_pct.toFixed(1)}%</span>
                </div>
                <GradientProgress value={data.uptime_pct} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Activity Indicators Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardContent className="p-4 text-center">
            <Activity className="w-5 h-5 mx-auto text-nagual-purple mb-2" />
            <p className="text-xs text-muted-foreground">{t('hb.interval')}</p>
            <p className="text-xl font-bold font-mono">{data.interval}s</p>
          </CardContent>
        </Card>
        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 mx-auto text-nagual-cyan mb-2" />
            <p className="text-xs text-muted-foreground">{t('hb.avgInterval')}</p>
            <p className="text-xl font-bold font-mono">{data.avg_interval.toFixed(1)}s</p>
          </CardContent>
        </Card>
        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardContent className="p-4 text-center">
            <Heart className="w-5 h-5 mx-auto text-nagual-red mb-2" />
            <p className="text-xs text-muted-foreground">{t('hb.missed')}</p>
            <p className="text-xl font-bold font-mono">{data.missed}</p>
          </CardContent>
        </Card>
        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardContent className="p-4 text-center">
            <Shield className="w-5 h-5 mx-auto text-nagual-green mb-2" />
            <p className="text-xs text-muted-foreground">{t('hb.uptime')}</p>
            <p className="text-xl font-bold font-mono">{data.uptime_pct.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
