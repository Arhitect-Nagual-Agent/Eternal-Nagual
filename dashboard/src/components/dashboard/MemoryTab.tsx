'use client';

import { motion } from 'framer-motion';
import {
  Database,
  Cpu,
  HardDrive,
  Link,
  RotateCcw,
  SplitSquareVertical,
  Plus,
  Activity,
  Circle,
  FileArchive,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useMemory } from '@/hooks/useNagualAPI';
import { useT } from '@/lib/i18n';

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.07 },
  }),
};

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

function StackedBar({ hot, warm, cold }: { hot: number; warm: number; cold: number }) {
  const t = useT();
  const total = hot + warm + cold;
  if (total === 0) return <div className="text-xs text-muted-foreground">{t('memory.noData')}</div>;

  const hotPct = (hot / total) * 100;
  const warmPct = (warm / total) * 100;
  const coldPct = (cold / total) * 100;

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full">
        <motion.div
          className="bg-green-500 h-full"
          initial={{ width: 0 }}
          animate={{ width: `${hotPct}%` }}
          transition={{ duration: 0.6 }}
        />
        <motion.div
          className="bg-yellow-500 h-full"
          initial={{ width: 0 }}
          animate={{ width: `${warmPct}%` }}
          transition={{ duration: 0.6, delay: 0.15 }}
        />
        <motion.div
          className="bg-gray-400 h-full"
          initial={{ width: 0 }}
          animate={{ width: `${coldPct}%` }}
          transition={{ duration: 0.6, delay: 0.3 }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Circle className="h-1.5 w-1.5 fill-green-500 text-green-500" />
          {t('memory.hot')}: {hot}
        </span>
        <span className="flex items-center gap-1">
          <Circle className="h-1.5 w-1.5 fill-yellow-500 text-yellow-500" />
          {t('memory.warm')}: {warm}
        </span>
        <span className="flex items-center gap-1">
          <Circle className="h-1.5 w-1.5 fill-gray-400 text-gray-400" />
          {t('memory.cold')}: {cold}
        </span>
      </div>
    </div>
  );
}

export default function MemoryTab() {
  const { data: memory, isLoading } = useMemory();
  const t = useT();

  if (isLoading || !memory) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="h-56 rounded-xl border border-border bg-card animate-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* EverMemOS */}
      <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
        <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300 h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#8b5cf6]/10 to-[#06b6d4]/10">
                <Database className="h-4 w-4 text-[#8b5cf6]" />
              </div>
              EverMemOS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              <MetricRow
                label={t('memory.totalCells')}
                value={<AnimatedNumber value={memory.EverMemOS.total_cells} />}
                icon={<Database className="h-3 w-3" />}
              />
              <MetricRow
                label={t('memory.activeCells')}
                value={<AnimatedNumber value={memory.EverMemOS.active_cells} />}
                icon={<Activity className="h-3 w-3" />}
              />
              <MetricRow
                label={t('memory.avgResonance')}
                value={<AnimatedNumber value={memory.EverMemOS.avg_resonance} decimals={2} />}
                icon={<Circle className="h-3 w-3" />}
              />
              <MetricRow
                label={t('memory.new24h')}
                value={<AnimatedNumber value={memory.EverMemOS.new_cells_24h} />}
                icon={<Plus className="h-3 w-3" />}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* MemoryMesh */}
      <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
        <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300 h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#8b5cf6]/10 to-[#06b6d4]/10">
                <Cpu className="h-4 w-4 text-[#8b5cf6]" />
              </div>
              MemoryMesh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              <MetricRow
                label={t('memory.total')}
                value={<AnimatedNumber value={memory.MemoryMesh.total} />}
              />
              <div className="py-2">
                <p className="text-xs text-muted-foreground mb-2">{t('memory.tierDistribution')}</p>
                <StackedBar
                  hot={memory.MemoryMesh.hot}
                  warm={memory.MemoryMesh.warm}
                  cold={memory.MemoryMesh.cold}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Persistent Memory */}
      <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
        <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300 h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#8b5cf6]/10 to-[#06b6d4]/10">
                <HardDrive className="h-4 w-4 text-[#8b5cf6]" />
              </div>
              {t('memory.persistent')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              <MetricRow
                label={t('memory.total')}
                value={<AnimatedNumber value={memory.Persistent.total} />}
                icon={<FileArchive className="h-3 w-3" />}
              />
              <MetricRow
                label={t('memory.categories')}
                value={<AnimatedNumber value={memory.Persistent.categories} />}
              />
              <MetricRow
                label={t('memory.lastWritten')}
                value={memory.Persistent.last_written || t('common.na')}
              />
              <MetricRow
                label={t('memory.size')}
                value={<><AnimatedNumber value={memory.Persistent.size_mb} decimals={1} suffix=" MB" /></>}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Resonance Memory */}
      <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
        <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300 h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#8b5cf6]/10 to-[#06b6d4]/10">
                <Link className="h-4 w-4 text-[#8b5cf6]" />
              </div>
              {t('memory.resonance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              <MetricRow
                label={t('memory.connections')}
                value={<AnimatedNumber value={memory.Resonance.connections} />}
                icon={<Link className="h-3 w-3" />}
              />
              <MetricRow
                label={t('memory.avgStrength')}
                value={<AnimatedNumber value={memory.Resonance.avg_strength} decimals={2} />}
              />
              <MetricRow
                label={t('memory.clusters')}
                value={<AnimatedNumber value={memory.Resonance.clusters} />}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recapitulation Memory */}
      <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible">
        <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300 h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#8b5cf6]/10 to-[#06b6d4]/10">
                <RotateCcw className="h-4 w-4 text-[#8b5cf6]" />
              </div>
              {t('memory.recap')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              <MetricRow
                label={t('memory.eventsProcessed')}
                value={<AnimatedNumber value={memory.Recapitulation.events_processed} />}
                icon={<RotateCcw className="h-3 w-3" />}
              />
              <MetricRow
                label={t('memory.chargeReleased')}
                value={<AnimatedNumber value={memory.Recapitulation.emotional_charge_released} decimals={1} />}
              />
              <MetricRow
                label={t('memory.patternsFound')}
                value={<AnimatedNumber value={memory.Recapitulation.patterns_found} />}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* DualMemory */}
      <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible">
        <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300 h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#8b5cf6]/10 to-[#06b6d4]/10">
                <SplitSquareVertical className="h-4 w-4 text-[#8b5cf6]" />
              </div>
              DualMemory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              <MetricRow
                label={t('memory.shortTerm')}
                value={<AnimatedNumber value={memory.DualMemory.short_term_items} />}
                icon={<SplitSquareVertical className="h-3 w-3" />}
              />
              <MetricRow
                label={t('memory.longTerm')}
                value={<AnimatedNumber value={memory.DualMemory.long_term_items} />}
              />
              <MetricRow
                label={t('memory.transferCount')}
                value={<AnimatedNumber value={memory.DualMemory.transfer_count} />}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
