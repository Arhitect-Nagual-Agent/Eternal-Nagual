'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  Brain,
  Cpu,
  Clock,
  Zap,
  Layers,
  Dna,
  BookOpen,
  FileText,
  Database,
  Heart,
  Users,
  Shield,
  TrendingDown,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/ui/MetricCard';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useStatus, useHeartbeat } from '@/hooks/useNagualAPI';
import { useT } from '@/lib/i18n';

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.05 },
  }),
};

function GradientProgress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-muted ${className ?? ''}`}>
      <motion.div
        className="h-full rounded-full gradient-fill"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
}

export default function StatusTab() {
  const t = useT();
  const { data: status, isLoading: statusLoading } = useStatus();
  const { data: heartbeat } = useHeartbeat();

  if (statusLoading || !status) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="h-24 rounded-xl border border-border bg-card animate-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
          />
        ))}
      </div>
    );
  }

  const isAntiDeathHealthy =
    status.anti_death_status === 'healthy' || status.anti_death_status === 'active';

  return (
    <div className="space-y-6">
      {/* Top Row: Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          label={t('status.cycle')}
          value={<AnimatedNumber value={status.cycle} />}
          icon={<Activity className="h-4 w-4" />}
          subtitle={`v${status.version}`}
        />
        <MetricCard
          label={t('status.interactions')}
          value={<AnimatedNumber value={status.interactions} />}
          icon={<Users className="h-4 w-4" />}
          subtitle={status.last_interaction ? `${t('status.last')}: ${new Date(status.last_interaction).toLocaleTimeString()}` : undefined}
        />
        <MetricCard
          label={t('status.consciousness')}
          value={<AnimatedNumber value={status.consciousness_level} suffix="%" />}
          icon={<Brain className="h-4 w-4" />}
          color="text-primary"
        />
        <MetricCard
          label={t('status.safetyScore')}
          value={<AnimatedNumber value={status.safety_score} suffix="%" />}
          icon={<Shield className="h-4 w-4" />}
          color={status.safety_score >= 90 ? 'text-green-600 dark:text-green-400' : status.safety_score >= 70 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}
        />
        <MetricCard
          label={t('status.uptime')}
          value={status.uptime}
          icon={<Clock className="h-4 w-4" />}
        />
        <MetricCard
          label={t('status.activeModules')}
          value={
            <span>
              <AnimatedNumber value={status.modules_active} />
              <span className="text-sm text-muted-foreground font-sans"> / {status.modules_total}</span>
            </span>
          }
          icon={<Layers className="h-4 w-4" />}
        />
      </div>

      {/* Second Row: Extended Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard label={t('status.evolutionCount')} value={<AnimatedNumber value={status.evolution_count} />} icon={<Dna className="h-4 w-4" />} />
        <MetricCard label={t('status.researchCount')} value={<AnimatedNumber value={status.research_count} />} icon={<BookOpen className="h-4 w-4" />} />
        <MetricCard label={t('status.filesParsed')} value={<AnimatedNumber value={status.files_parsed} />} icon={<FileText className="h-4 w-4" />} />
        <MetricCard label={t('status.memoryCells')} value={<AnimatedNumber value={status.memory_cells} />} icon={<Database className="h-4 w-4" />} />
        <MetricCard
          label={t('status.heartbeats')}
          value={<AnimatedNumber value={status.heartbeat_count} />}
          icon={<Heart className="h-4 w-4" />}
          subtitle={heartbeat ? `${t('status.nextIn')} ${heartbeat.next_in}s` : undefined}
        />
        <MetricCard label={t('status.activeSubagents')} value={<AnimatedNumber value={status.active_subagents} />} icon={<Cpu className="h-4 w-4" />} />
      </div>

      {/* Third Row: Health Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Anti-Death Status */}
        <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#7C3AED]/10 to-[#06B6D4]/10">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                {t('status.antiDeath')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Badge
                  className={`text-xs px-2.5 py-1 ${
                    isAntiDeathHealthy
                      ? 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30'
                      : 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
                  }`}
                >
                  {status.anti_death_status}
                </Badge>
                {heartbeat && (
                  <span className="text-xs text-muted-foreground">
                    {t('status.restartsPrevented')}: {heartbeat.anti_death.restarts_prevented}
                  </span>
                )}
              </div>
              {heartbeat && (
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t('status.uptime')}</span>
                    <span className="font-mono">{heartbeat.uptime_pct.toFixed(1)}%</span>
                  </div>
                  <GradientProgress value={heartbeat.uptime_pct} />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Drift Score */}
        <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#7C3AED]/10 to-[#06B6D4]/10">
                  <TrendingDown className="h-4 w-4 text-primary" />
                </div>
                {t('status.driftScore')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-foreground">
                  <AnimatedNumber value={status.drift_score} decimals={2} />
                </span>
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t('status.driftLevel')}</span>
                  <span className="font-mono">{status.drift_score.toFixed(3)}</span>
                </div>
                <GradientProgress value={Math.min(100, status.drift_score * 100)} />
              </div>
              {heartbeat && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {t('status.missed')}: <span className="font-mono">{heartbeat.missed}</span> |
                  {' '}{t('status.avgInterval')}: <span className="font-mono">{heartbeat.avg_interval}ms</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Mode */}
        <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#7C3AED]/10 to-[#06B6D4]/10">
                  <Settings className="h-4 w-4 text-primary" />
                </div>
                {t('status.systemMode')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-gradient-to-r from-[#7C3AED]/10 to-[#06B6D4]/10 text-primary border-primary/20 text-sm px-3 py-1">
                {status.mode}
              </Badge>
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>{t('status.tokensApprox')}</span>
                  <span className="font-mono">
                    <AnimatedNumber value={status.total_tokens_approx} />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t('status.heartbeatInterval')}</span>
                  <span className="font-mono">{heartbeat ? `${heartbeat.interval}ms` : '---'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
