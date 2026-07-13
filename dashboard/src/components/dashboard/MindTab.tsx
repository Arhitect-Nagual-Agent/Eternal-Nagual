'use client';

import { motion } from 'framer-motion';
import {
  Brain,
  Eye,
  Crosshair,
  Sparkles,
  Zap,
  Moon,
  Wind,
  Flame,
  Axis3d,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/ui/MetricCard';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useMind } from '@/hooks/useNagualAPI';
import { useT } from '@/lib/i18n';

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06 },
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

function ConsciousnessBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-xs font-mono font-semibold text-foreground">
          <AnimatedNumber value={value} decimals={1} suffix="%" />
        </span>
      </div>
      <GradientProgress value={value} />
    </div>
  );
}

export default function MindTab() {
  const { data: mind, isLoading } = useMind();
  const t = useT();

  if (isLoading || !mind) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <motion.div
            key={i}
            className="h-28 rounded-xl border border-border bg-card animate-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Assembly Point Coordinates */}
      <motion.div
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#8b5cf6]/10 to-[#06b6d4]/10">
                <Axis3d className="h-4 w-4 text-[#8b5cf6]" />
              </div>
              {t('toltec.assemblyPoint')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-medium text-muted-foreground mb-1">X</p>
                <p className="text-xl font-bold font-mono text-[#8b5cf6]">
                  <AnimatedNumber value={mind.assembly_point.x} decimals={4} />
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-medium text-muted-foreground mb-1">Y</p>
                <p className="text-xl font-bold font-mono text-[#06b6d4]">
                  <AnimatedNumber value={mind.assembly_point.y} decimals={4} />
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-medium text-muted-foreground mb-1">Z</p>
                <p className="text-xl font-bold font-mono text-foreground">
                  <AnimatedNumber value={mind.assembly_point.z} decimals={4} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Attention & Focus Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300">
            <CardContent className="pt-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {t('toltec.attentionState')}
              </p>
              <Badge className="bg-gradient-to-r from-[#8b5cf6]/10 to-[#06b6d4]/10 text-[#8b5cf6] border-[#8b5cf6]/20 px-3 py-1">
                {mind.attention_state}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300">
            <CardContent className="pt-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {t('mind.focus')}
              </p>
              <div className="flex items-center gap-2">
                <Crosshair className="h-4 w-4 text-[#8b5cf6]" />
                <span className="text-sm font-semibold font-mono">{mind.focus}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300">
            <CardContent className="pt-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {t('mind.thirdAttention')}
              </p>
              <Badge
                className={`px-3 py-1 ${
                  mind.third_active
                    ? 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30'
                    : 'bg-muted text-muted-foreground border-border'
                }`}
              >
                {mind.third_active ? t('common.active') : t('common.inactive')}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

      </div>

      {/* Energy Level */}
      <motion.div
        custom={8}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#8b5cf6]/10 to-[#06b6d4]/10">
                <Flame className="h-4 w-4 text-[#8b5cf6]" />
              </div>
              {t('toltec.energyLevel')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-4xl font-bold font-mono text-foreground">
                <AnimatedNumber value={mind.energy} decimals={1} />
              </span>
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <GradientProgressLarge value={mind.energy} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
