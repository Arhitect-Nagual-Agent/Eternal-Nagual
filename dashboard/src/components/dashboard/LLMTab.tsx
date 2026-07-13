'use client';

import { motion } from 'framer-motion';
import {
  Cpu,
  Zap,
  Timer,
  Hash,
  Server,
  ArrowRightLeft,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Layers,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/ui/MetricCard';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useLLM } from '@/hooks/useNagualAPI';
import RouterPanel from '@/components/dashboard/RouterPanel';

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

export default function LLMTab() {
  const { data: llm, isLoading } = useLLM();

  if (isLoading || !llm) {
    return (
      <div className="space-y-6">
        <RouterPanel />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              className="h-24 rounded-xl border border-border bg-card animate-pulse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <motion.div
              key={i}
              className="h-48 rounded-xl border border-border bg-card animate-pulse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 + i * 0.03 }}
            />
          ))}
        </div>
      </div>
    );
  }

  const totalCalls = llm.stats.total_calls || 1;

  return (
    <div className="space-y-6">
      <RouterPanel />

      {/* Total Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Calls"
          value={<AnimatedNumber value={llm.stats.total_calls} />}
          icon={<ArrowRightLeft className="h-4 w-4" />}
        />
        <MetricCard
          label="Total Tokens"
          value={<AnimatedNumber value={llm.stats.total_tokens} />}
          icon={<Hash className="h-4 w-4" />}
        />
        <MetricCard
          label="Avg Latency"
          value={<AnimatedNumber value={llm.stats.avg_latency_ms} suffix=" ms" />}
          icon={<Timer className="h-4 w-4" />}
        />
        <MetricCard
          label="Cache Hit Rate"
          value={<AnimatedNumber value={llm.stats.cache_hit_rate} suffix="%" />}
          icon={<Zap className="h-4 w-4" />}
          color="text-[#06b6d4]"
        />
      </div>

      {/* LLM Slots */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          LLM Slots
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {llm.slots.map((slot, idx) => (
            <motion.div
              key={idx}
              custom={idx}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <Card className={`hover:border-[#8b5cf6]/30 transition-all duration-300 ${!slot.enabled ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-sm font-bold">{slot.model}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {slot.provider}
                      </Badge>
                      <Badge className="bg-gradient-to-r from-[#8b5cf6]/10 to-[#06b6d4]/10 text-[#8b5cf6] border-[#8b5cf6]/20 text-[10px] px-1.5 py-0">
                        P{slot.priority}
                      </Badge>
                      <Badge
                        className={`text-[10px] px-1.5 py-0 ${
                          slot.enabled
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-red-100 text-red-700 border-red-200'
                        }`}
                      >
                        {slot.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Calls</p>
                      <p className="font-mono font-semibold mt-0.5">
                        <AnimatedNumber value={slot.stats.total_calls} />
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Latency</p>
                      <p className="font-mono font-semibold mt-0.5">
                        <AnimatedNumber value={slot.stats.avg_latency_ms} decimals={0} /> ms
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Failures</p>
                      <p className="font-mono font-semibold mt-0.5 text-red-600">
                        <AnimatedNumber value={slot.stats.failures} />
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Used</p>
                      <p className="font-mono font-semibold mt-0.5 text-muted-foreground">
                        {slot.stats.last_used
                          ? new Date(slot.stats.last_used).toLocaleTimeString()
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                  {/* Call distribution bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Call Distribution</span>
                      <span className="font-mono">
                        {totalCalls > 0 ? ((slot.stats.total_calls / totalCalls) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <GradientProgress
                      value={totalCalls > 0 ? (slot.stats.total_calls / totalCalls) * 100 : 0}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Providers */}
      <motion.div
        custom={llm.slots.length}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#8b5cf6]/10 to-[#06b6d4]/10">
                <Server className="h-4 w-4 text-[#8b5cf6]" />
              </div>
              Providers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {llm.providers.map((provider, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-semibold">{provider.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      <AnimatedNumber value={provider.models.length} /> model{provider.models.length !== 1 ? 's' : ''}
                    </span>
                    <Badge
                      className={`text-[10px] px-2 py-0.5 ${
                        provider.status === 'online' || provider.status === 'active'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-red-100 text-red-700 border-red-200'
                      }`}
                    >
                      {provider.status === 'online' || provider.status === 'active' ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-2.5 w-2.5" /> Online
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <XCircle className="h-2.5 w-2.5" /> Offline
                        </span>
                      )}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
