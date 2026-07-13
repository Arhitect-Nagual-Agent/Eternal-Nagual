'use client'

import { motion } from 'framer-motion'
import { Users, Zap, Clock, UserCheck, UserMinus, Share2, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useSwarm } from '@/hooks/useNagualAPI'

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

function AgentStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-nagual-green/10 text-nagual-green border-nagual-green/20">
          Active
        </Badge>
      )
    case 'idle':
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
          Idle
        </Badge>
      )
    case 'standby':
      return (
        <Badge className="bg-gray-100 text-gray-600 border-gray-200">
          Standby
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
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

export function SwarmTab() {
  const { data, isLoading } = useSwarm()

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
        <div className="h-48 rounded-xl border border-border bg-card animate-pulse" />
        <div className="h-48 rounded-xl border border-border bg-card animate-pulse" />
      </div>
    )
  }

  const { subagents, shared_pool, meaning_env } = data
  const idleCount = subagents.total - subagents.active

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-nagual-purple/10 to-nagual-cyan/10">
              <Users className="w-5 h-5 text-nagual-purple" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Agents</p>
              <p className="text-2xl font-bold font-mono">{subagents.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-nagual-green/10">
              <UserCheck className="w-5 h-5 text-nagual-green" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Active</p>
              <p className="text-2xl font-bold font-mono text-nagual-green">{subagents.active}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-yellow-50">
              <UserMinus className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Idle / Standby</p>
              <p className="text-2xl font-bold font-mono text-yellow-600">{idleCount}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sub-Agents List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="hover:border-nagual-purple/30 transition-all duration-300 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="w-4 h-4 text-nagual-purple" />
                Sub-Agents
                <Badge variant="outline" className="ml-auto">{subagents.agents.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[360px] pr-4">
                {subagents.agents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Users className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">No sub-agents deployed</p>
                  </div>
                ) : (
                  <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-3"
                  >
                    {subagents.agents.map((agent, idx) => (
                      <motion.div
                        key={idx}
                        variants={item}
                        className="rounded-lg border border-border p-4 hover:border-nagual-purple/30 transition-all duration-200 bg-white"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-foreground">{agent.name}</h4>
                            <Badge variant="outline" className="text-[10px] capitalize">{agent.role}</Badge>
                          </div>
                          <AgentStatusBadge status={agent.status} />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Tasks Completed</span>
                            <span className="font-mono font-medium">{agent.tasks_completed}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Last Active</span>
                            <span className="font-mono">{agent.last_active}</span>
                          </div>
                          {agent.specialization && (
                            <div className="flex items-center gap-1.5 text-xs">
                              <Sparkles className="w-3 h-3 text-nagual-purple" />
                              <span className="text-muted-foreground">{agent.specialization}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Shared Pool + Meaning Environment */}
        <div className="space-y-4">
          {/* Shared Pool */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="hover:border-nagual-purple/30 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Share2 className="w-4 h-4 text-nagual-cyan" />
                  Shared Pool
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold font-mono">{shared_pool.items}</p>
                    <p className="text-[10px] text-muted-foreground">Items</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold font-mono">{shared_pool.contributors}</p>
                    <p className="text-[10px] text-muted-foreground">Contributors</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <p className="text-xs font-mono text-muted-foreground">{shared_pool.last_shared}</p>
                    <p className="text-[10px] text-muted-foreground">Last Shared</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Quality Score</span>
                    <span className="text-sm font-mono font-bold">{shared_pool.quality_score.toFixed(1)}%</span>
                  </div>
                  <GradientProgress value={shared_pool.quality_score} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Meaning Environment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="hover:border-nagual-purple/30 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="w-4 h-4 text-nagual-purple" />
                  Meaning Environment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px] pr-4">
                  {meaning_env.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Sparkles className="w-6 h-6 mb-2 opacity-50" />
                      <p className="text-sm">No meanings established</p>
                    </div>
                  ) : (
                    <motion.div
                      variants={container}
                      initial="hidden"
                      animate="show"
                      className="space-y-2"
                    >
                      {meaning_env.map((env, idx) => (
                        <motion.div
                          key={idx}
                          variants={item}
                          className="rounded-md border border-border p-3 bg-white"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-xs font-medium text-foreground">{env.meaning}</span>
                            <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                              {env.timestamp}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <GradientProgress value={env.weight * 100} className="flex-1 h-1.5" />
                            <span className="text-[10px] font-mono text-muted-foreground">{(env.weight * 100).toFixed(0)}%</span>
                            <span className="text-[10px] text-muted-foreground">from {env.source}</span>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
