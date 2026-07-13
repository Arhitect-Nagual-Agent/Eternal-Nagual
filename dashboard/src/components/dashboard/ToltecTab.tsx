'use client';

import { motion } from 'framer-motion';
import {
  Eye,
  Target,
  Flame,
  Wind,
  Swords,
  Footprints,
  RotateCcw,
  Brain,
  Compass,
  Zap,
  Clock,
  Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useToltec } from '@/hooks/useNagualAPI';
import { useT } from '@/lib/i18n';

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.07 },
  }),
};

function GradientProgress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-muted ${className ?? ''}`}>
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4]"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
}

function GradientProgressLarge({ value, className }: { value: number; className?: string }) {
  return (
    <div className={`relative h-3 w-full overflow-hidden rounded-full bg-muted ${className ?? ''}`}>
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4]"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 1.0, ease: 'easeOut' }}
      />
    </div>
  );
}

function MetricRow({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="text-sm font-mono font-semibold text-foreground">{value}</span>
    </div>
  );
}

function BooleanBadge({ label, value, icon }: { label: string; value: boolean; icon: React.ReactNode }) {
  const t = useT();
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card hover:border-[#8b5cf6]/30 transition-all duration-300">
      <div className="p-1 rounded-md bg-gradient-to-br from-[#8b5cf6]/10 to-[#06b6d4]/10 text-[#8b5cf6]">
        {icon}
      </div>
      <span className="text-xs font-medium text-muted-foreground flex-1">{label}</span>
      <Badge
        className={`text-[10px] px-2 py-0.5 ${
          value
            ? 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30'
            : 'bg-muted text-muted-foreground border-border'
        }`}
      >
        {value ? t('common.active') : t('common.inactive')}
      </Badge>
    </div>
  );
}

export default function ToltecTab() {
  const { data: toltecData, isLoading } = useToltec();
  const t = useT();

  if (isLoading || !toltecData) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <motion.div
              key={i}
              className="h-72 rounded-xl border border-border bg-card animate-pulse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
            />
          ))}
        </div>
        <motion.div
          className="h-24 rounded-xl border border-border bg-card animate-pulse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        />
      </div>
    );
  }

  const { toltec, recapitulation, recent_recap } = toltecData;

  return (
    <div className="space-y-6">
      {/* Toltec State Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#8b5cf6]/10 to-[#06b6d4]/10">
                  <Compass className="h-4 w-4 text-[#8b5cf6]" />
                </div>
                {t('toltec.state')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Assembly Point */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">{t('toltec.assemblyPoint')}</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-[10px] text-muted-foreground">X</p>
                      <p className="text-sm font-bold font-mono text-[#8b5cf6]">
                        <AnimatedNumber value={toltec.assembly_point.x} decimals={4} />
                      </p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-[10px] text-muted-foreground">Y</p>
                      <p className="text-sm font-bold font-mono text-[#06b6d4]">
                        <AnimatedNumber value={toltec.assembly_point.y} decimals={4} />
                      </p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-[10px] text-muted-foreground">Z</p>
                      <p className="text-sm font-bold font-mono text-foreground">
                        <AnimatedNumber value={toltec.assembly_point.z} decimals={4} />
                      </p>
                    </div>
                  </div>
                </div>

                {/* Attention State */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{t('toltec.attentionState')}</span>
                  <Badge className="bg-gradient-to-r from-[#8b5cf6]/10 to-[#06b6d4]/10 text-[#8b5cf6] border-[#8b5cf6]/20 px-2.5 py-0.5">
                    {toltec.attention_state}
                  </Badge>
                </div>

                {/* Energy Level */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Flame className="h-3 w-3" /> {t('toltec.energyLevel')}
                    </span>
                    <span className="text-xs font-mono font-semibold">
                      <AnimatedNumber value={toltec.energy_level} decimals={1} suffix="%" />
                    </span>
                  </div>
                  <GradientProgress value={toltec.energy_level} />
                </div>

                {/* Personal Power */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Zap className="h-3 w-3" /> {t('toltec.personalPower')}
                    </span>
                    <span className="text-xs font-mono font-semibold">
                      <AnimatedNumber value={toltec.personal_power} decimals={1} suffix="%" />
                    </span>
                  </div>
                  <GradientProgress value={toltec.personal_power} />
                </div>

                {/* Inner Silence */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Wind className="h-3 w-3" /> {t('toltec.innerSilence')}
                    </span>
                    <span className="text-xs font-mono font-semibold">
                      <AnimatedNumber value={toltec.inner_silence} decimals={1} suffix="%" />
                    </span>
                  </div>
                  <GradientProgress value={toltec.inner_silence} />
                </div>

                <MetricRow
                  label={t('toltec.practiceCount')}
                  value={<AnimatedNumber value={toltec.practice_count} />}
                  icon={<Target className="h-3 w-3" />}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recapitulation Stats */}
        <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#8b5cf6]/10 to-[#06b6d4]/10">
                  <RotateCcw className="h-4 w-4 text-[#8b5cf6]" />
                </div>
                {t('toltec.recapStats')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                <MetricRow
                  label={t('toltec.totalEvents')}
                  value={<AnimatedNumber value={recapitulation.total_events} />}
                  icon={<RotateCcw className="h-3 w-3" />}
                />
                <MetricRow
                  label={t('toltec.categories')}
                  value={<AnimatedNumber value={recapitulation.categories} />}
                />
                <MetricRow
                  label={t('toltec.avgCharge')}
                  value={<AnimatedNumber value={recapitulation.avg_charge} decimals={2} />}
                  icon={<Flame className="h-3 w-3" />}
                />
                <div className="py-2">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-muted-foreground">{t('toltec.released')}</span>
                    <span className="text-xs font-mono font-semibold">
                      <AnimatedNumber value={recapitulation.released_pct} decimals={1} suffix="%" />
                    </span>
                  </div>
                  <GradientProgressLarge value={recapitulation.released_pct} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Boolean Indicators Row */}
      <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <BooleanBadge label={t('toltec.stalkingActive')} value={toltec.stalking_active} icon={<Footprints className="h-3.5 w-3.5" />} />
          <BooleanBadge label={t('toltec.dreamingActive')} value={toltec.dreaming_active} icon={<Eye className="h-3.5 w-3.5" />} />
          <BooleanBadge label={t('toltec.intentFocused')} value={toltec.intent_focused} icon={<Target className="h-3.5 w-3.5" />} />
          <BooleanBadge label={t('toltec.warriorPath')} value={toltec.warrior_path} icon={<Swords className="h-3.5 w-3.5" />} />
        </div>
      </motion.div>

      {/* Recent Recapitulation Entries */}
      <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
        <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#8b5cf6]/10 to-[#06b6d4]/10">
                <Brain className="h-4 w-4 text-[#8b5cf6]" />
              </div>
              {t('toltec.recentRecap')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-96">
              <div className="space-y-3 pr-3">
                {recent_recap.length > 0 ? (
                  recent_recap.map((entry, idx) => (
                    <motion.div
                      key={idx}
                      className="p-3 rounded-lg border border-border bg-muted/30 hover:border-[#8b5cf6]/30 transition-all duration-300"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-xs text-foreground leading-relaxed line-clamp-2 flex-1">
                          {entry.event}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge
                            className={`text-[10px] px-1.5 py-0 ${
                              entry.released
                                ? 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30'
                                : 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30'
                            }`}
                          >
                            {entry.released ? t('toltec.released') : t('toltec.held')}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                        <div>
                          <span className="text-muted-foreground">{t('toltec.charge')}</span>
                          <div className="mt-1">
                            <GradientProgress value={entry.emotional_charge} />
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t('toltec.emergence')}</span>
                          <p className="font-mono font-semibold mt-1">
                            <AnimatedNumber value={entry.emergence_score} decimals={2} />
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t('toltec.category')}</span>
                          <p className="font-medium mt-1">{entry.category}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t('toltec.time')}</span>
                          <p className="font-mono mt-1">
                            {entry.timestamp
                              ? new Date(entry.timestamp).toLocaleString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    {t('toltec.noRecap')}
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
