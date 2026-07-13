'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  Box,
  Thermometer,
  Clock,
  ListChecks,
  Scale,
  Ban,
  ArrowDown,
  CheckCircle,
  XCircle,
  Gavel,
  Lock,
  Waves,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MetricCard } from '@/components/ui/MetricCard';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useSafety } from '@/hooks/useNagualAPI';

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

function getSeverityColor(severity: string) {
  switch (severity.toLowerCase()) {
    case 'critical':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'low':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'info':
      return 'bg-gray-100 text-gray-600 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

export default function SafetyTab() {
  const { data: safety, isLoading } = useSafety();

  if (isLoading || !safety) {
    return (
      <div className="space-y-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
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

  return (
    <div className="space-y-6">
      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Checks"
          value={<AnimatedNumber value={safety.manager.total_checks} />}
          icon={<ListChecks className="h-4 w-4" />}
        />
        <MetricCard
          label="Violations"
          value={<AnimatedNumber value={safety.manager.violations} />}
          icon={<AlertTriangle className="h-4 w-4" />}
          color={safety.manager.violations > 0 ? 'text-red-600' : 'text-green-600'}
        />
        <MetricCard
          label="Violation Rate"
          value={<AnimatedNumber value={safety.manager.violation_rate} decimals={2} suffix="%" />}
          icon={<Scale className="h-4 w-4" />}
        />
        <MetricCard
          label="Active Rules"
          value={<AnimatedNumber value={safety.manager.active_rules} />}
          icon={<Gavel className="h-4 w-4" />}
        />
      </div>

      {/* Safety System Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Safety Manager */}
        <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#8b5cf6]/10 to-[#06b6d4]/10">
                  <Shield className="h-4 w-4 text-[#8b5cf6]" />
                </div>
                Safety Manager
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                <MetricRow
                  label="Total Checks"
                  value={<AnimatedNumber value={safety.manager.total_checks} />}
                  icon={<ListChecks className="h-3 w-3" />}
                />
                <MetricRow
                  label="Violations"
                  value={<AnimatedNumber value={safety.manager.violations} />}
                  icon={<AlertTriangle className="h-3 w-3" />}
                />
                <MetricRow
                  label="Violation Rate"
                  value={<AnimatedNumber value={safety.manager.violation_rate} decimals={2} suffix="%" />}
                />
                <MetricRow
                  label="Active Rules"
                  value={<AnimatedNumber value={safety.manager.active_rules} />}
                  icon={<Gavel className="h-3 w-3" />}
                />
                <MetricRow
                  label="Last Check"
                  value={safety.manager.last_check || 'N/A'}
                  icon={<Clock className="h-3 w-3" />}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Asimov Filter */}
        <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#8b5cf6]/10 to-[#06b6d4]/10">
                  <Scale className="h-4 w-4 text-[#8b5cf6]" />
                </div>
                Asimov Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <Badge
                    className={`px-2.5 py-0.5 ${
                      safety.asimov.status === 'active' || safety.asimov.status === 'healthy'
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    }`}
                  >
                    {safety.asimov.status}
                  </Badge>
                </div>
                <MetricRow
                  label="Laws Enforced"
                  value={<AnimatedNumber value={safety.asimov.laws_enforced} />}
                  icon={<Gavel className="h-3 w-3" />}
                />
                <MetricRow
                  label="Interventions"
                  value={<AnimatedNumber value={safety.asimov.interventions} />}
                  icon={<Ban className="h-3 w-3" />}
                />
                <MetricRow
                  label="Last Intervention"
                  value={safety.asimov.last_intervention || 'Never'}
                  icon={<Clock className="h-3 w-3" />}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sandbox */}
        <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300 h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#8b5cf6]/10 to-[#06b6d4]/10">
                    <Box className="h-4 w-4 text-[#8b5cf6]" />
                  </div>
                  Sandbox
                </CardTitle>
                <Badge
                  className={`px-2.5 py-0.5 ${
                    safety.sandbox.active
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-red-100 text-red-700 border-red-200'
                  }`}
                >
                  {safety.sandbox.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                <MetricRow
                  label="Type"
                  value={safety.sandbox.type || 'N/A'}
                  icon={<Box className="h-3 w-3" />}
                />
                <MetricRow
                  label="Restrictions"
                  value={<AnimatedNumber value={safety.sandbox.restrictions} />}
                  icon={<Lock className="h-3 w-3" />}
                />
                <MetricRow
                  label="Escaped"
                  value={
                    <span className={safety.sandbox.escaped_count > 0 ? 'text-red-600' : 'text-green-600'}>
                      <AnimatedNumber value={safety.sandbox.escaped_count} />
                    </span>
                  }
                  icon={<AlertTriangle className="h-3 w-3" />}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Entropy Damper */}
        <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300 h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#8b5cf6]/10 to-[#06b6d4]/10">
                    <Thermometer className="h-4 w-4 text-[#8b5cf6]" />
                  </div>
                  Entropy Damper
                </CardTitle>
                <Badge
                  className={`px-2.5 py-0.5 ${
                    safety.damper.active
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-red-100 text-red-700 border-red-200'
                  }`}
                >
                  {safety.damper.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                <MetricRow
                  label="Entropy Level"
                  value={<AnimatedNumber value={safety.damper.entropy_level} decimals={2} />}
                  icon={<Waves className="h-3 w-3" />}
                />
                <MetricRow
                  label="Damping Rate"
                  value={<AnimatedNumber value={safety.damper.damping_rate} decimals={2} />}
                  icon={<ArrowDown className="h-3 w-3" />}
                />
                <MetricRow
                  label="Threshold"
                  value={<AnimatedNumber value={safety.damper.threshold} decimals={2} />}
                />
                <MetricRow
                  label="Interventions"
                  value={<AnimatedNumber value={safety.damper.interventions} />}
                  icon={<AlertTriangle className="h-3 w-3" />}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Violations */}
      <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible">
        <Card className="hover:border-[#8b5cf6]/30 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#8b5cf6]/10 to-[#06b6d4]/10">
                <AlertTriangle className="h-4 w-4 text-[#8b5cf6]" />
              </div>
              Recent Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-96">
              <div className="space-y-2 pr-3">
                {safety.violations.length > 0 ? (
                  safety.violations.map((violation, idx) => (
                    <motion.div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:border-[#8b5cf6]/30 transition-all duration-300"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.04 }}
                    >
                      <div className="flex items-center gap-2 shrink-0">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                          {violation.timestamp
                            ? new Date(violation.timestamp).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'N/A'}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 shrink-0"
                      >
                        {violation.type}
                      </Badge>
                      <Badge className={`text-[10px] px-1.5 py-0 shrink-0 ${getSeverityColor(violation.severity)}`}>
                        {violation.severity}
                      </Badge>
                      <p className="text-xs text-foreground flex-1 line-clamp-1">{violation.description}</p>
                      <Badge
                        className={`text-[10px] px-1.5 py-0 shrink-0 ${
                          violation.resolved
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-red-100 text-red-700 border-red-200'
                        }`}
                      >
                        {violation.resolved ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-2.5 w-2.5" /> Resolved
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <XCircle className="h-2.5 w-2.5" /> Unresolved
                          </span>
                        )}
                      </Badge>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    No violations recorded
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
