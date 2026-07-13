'use client';

import { motion } from 'framer-motion';
import {
  Dna,
  Lightbulb,
  BookOpen,
  FileArchive,
  FlaskConical,
  GraduationCap,
  Sparkles,
  Clock,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useEvolution } from '@/hooks/useNagualAPI';

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08 },
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

export default function EvolutionTab() {
  const { data: evolution, isLoading } = useEvolution();

  if (isLoading || !evolution) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Self-Evolution */}
      <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
        <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300 h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#8b5cf6]/10 to-[#06b6d4]/10">
                  <Dna className="h-4 w-4 text-[#8b5cf6]" />
                </div>
                Self-Evolution
              </CardTitle>
              <Badge
                className={`px-2.5 py-0.5 ${
                  evolution.self_evolution.enabled
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}
              >
                {evolution.self_evolution.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              <MetricRow
                label="Iterations"
                value={<AnimatedNumber value={evolution.self_evolution.iterations} />}
                icon={<FlaskConical className="h-3 w-3" />}
              />
              <MetricRow
                label="Improvements Applied"
                value={<AnimatedNumber value={evolution.self_evolution.improvements_applied} />}
                icon={<CheckCircle className="h-3 w-3" />}
              />
              <div className="py-2">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-muted-foreground">Success Rate</span>
                  <span className="text-xs font-mono font-semibold">
                    <AnimatedNumber value={evolution.self_evolution.success_rate} decimals={1} suffix="%" />
                  </span>
                </div>
                <GradientProgress value={evolution.self_evolution.success_rate} />
              </div>
              <div className="py-2">
                <p className="text-xs text-muted-foreground mb-1">Current Hypothesis</p>
                <p className="text-xs font-mono text-foreground leading-relaxed line-clamp-3">
                  {evolution.self_evolution.current_hypothesis || 'No active hypothesis'}
                </p>
              </div>
              <MetricRow
                label="Last Improvement"
                value={evolution.self_evolution.last_improvement || 'N/A'}
                icon={<Clock className="h-3 w-3" />}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* DGM Archive */}
      <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
        <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300 h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#8b5cf6]/10 to-[#06b6d4]/10">
                <FileArchive className="h-4 w-4 text-[#8b5cf6]" />
              </div>
              DGM Archive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              <MetricRow
                label="Total Documents"
                value={<AnimatedNumber value={evolution.dgm.total_documents} />}
                icon={<FileArchive className="h-3 w-3" />}
              />
              <MetricRow
                label="Categories"
                value={<AnimatedNumber value={evolution.dgm.categories} />}
              />
              <MetricRow
                label="Avg Relevance"
                value={<AnimatedNumber value={evolution.dgm.avg_relevance} decimals={2} />}
                icon={<TrendingUp className="h-3 w-3" />}
              />
              <div className="py-2">
                <p className="text-xs text-muted-foreground mb-2">Key Topics</p>
                <div className="flex flex-wrap gap-1.5">
                  {evolution.dgm.key_topics.length > 0 ? (
                    evolution.dgm.key_topics.map((topic, idx) => (
                      <Badge
                        key={idx}
                        className="bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20 text-[10px] px-2 py-0.5"
                      >
                        {topic}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No topics yet</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Karpathy Research */}
      <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
        <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300 h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#8b5cf6]/10 to-[#06b6d4]/10">
                  <GraduationCap className="h-4 w-4 text-[#8b5cf6]" />
                </div>
                Karpathy Research
              </CardTitle>
              <Badge
                className={`px-2.5 py-0.5 ${
                  evolution.karpathy.active
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}
              >
                {evolution.karpathy.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              <MetricRow
                label="Papers Analyzed"
                value={<AnimatedNumber value={evolution.karpathy.papers_analyzed} />}
                icon={<BookOpen className="h-3 w-3" />}
              />
              <div className="py-2">
                <p className="text-xs text-muted-foreground mb-1">Current Topic</p>
                <p className="text-xs font-mono text-foreground leading-relaxed">
                  {evolution.karpathy.current_topic || 'No active topic'}
                </p>
              </div>
              <MetricRow
                label="Insights Generated"
                value={<AnimatedNumber value={evolution.karpathy.insights_generated} />}
                icon={<Lightbulb className="h-3 w-3" />}
              />
              <MetricRow
                label="Last Research"
                value={evolution.karpathy.last_research || 'N/A'}
                icon={<Clock className="h-3 w-3" />}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Archive */}
      <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
        <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300 h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#8b5cf6]/10 to-[#06b6d4]/10">
                <Sparkles className="h-4 w-4 text-[#8b5cf6]" />
              </div>
              Evolution Archive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              <MetricRow
                label="Total Entries"
                value={<AnimatedNumber value={evolution.archive.total} />}
                icon={<FileArchive className="h-3 w-3" />}
              />
              <MetricRow
                label="Last Updated"
                value={evolution.archive.last_updated || 'N/A'}
                icon={<Clock className="h-3 w-3" />}
              />
              <MetricRow
                label="Size"
                value={<><AnimatedNumber value={evolution.archive.size_mb} decimals={1} /> MB</>}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
