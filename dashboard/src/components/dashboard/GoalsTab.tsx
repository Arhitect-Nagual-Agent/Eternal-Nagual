'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, CheckCircle2, BarChart3, ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useGoals } from '@/hooks/useNagualAPI'

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

function PriorityBadge({ priority }: { priority: string }) {
  switch (priority) {
    case 'critical':
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          Critical
        </Badge>
      )
    case 'high':
      return (
        <Badge className="bg-orange-100 text-orange-700 border-orange-200">
          High
        </Badge>
      )
    case 'medium':
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
          Medium
        </Badge>
      )
    default:
      return <Badge variant="outline">{priority}</Badge>
  }
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return (
        <Badge className="bg-nagual-green/10 text-nagual-green border-nagual-green/20">
          Completed
        </Badge>
      )
    case 'in_progress':
      return (
        <Badge className="bg-nagual-purple/10 text-nagual-purple border-nagual-purple/20">
          In Progress
        </Badge>
      )
    case 'pending':
      return (
        <Badge className="bg-gray-100 text-gray-600 border-gray-200">
          Pending
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function GoalCard({ goal, index }: { goal: import('@/lib/types').Goal; index: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const hasSubgoals = goal.subgoals && goal.subgoals.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="hover:border-nagual-purple/30 transition-all duration-300 overflow-hidden">
          <CollapsibleTrigger asChild>
            <button className="w-full text-left">
              <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-foreground">{goal.title}</h4>
                      <PriorityBadge priority={goal.priority} />
                      <StatusBadge status={goal.status} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <GradientProgress value={goal.progress} className="flex-1" />
                        <span className="text-sm font-mono font-bold min-w-[40px] text-right">
                          {goal.progress.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {hasSubgoals && (
                      <>
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
            </button>
          </CollapsibleTrigger>

          <AnimatePresence>
            {isOpen && (
              <CollapsibleContent forceMount>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <CardContent className="pt-0 space-y-3">
                    <Separator />
                    {goal.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {goal.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Created: <span className="font-mono">{goal.created}</span></span>
                      <span>Updated: <span className="font-mono">{goal.updated}</span></span>
                    </div>

                    {hasSubgoals && (
                      <div className="space-y-2 mt-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Subgoals ({goal.subgoals!.length})
                        </p>
                        <div className="space-y-2 pl-2">
                          {goal.subgoals!.map((subgoal, subIdx) => (
                            <div
                              key={subgoal.id || subIdx}
                              className="rounded-md border border-border p-3 bg-muted/20"
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-foreground">{subgoal.title}</span>
                                  <StatusBadge status={subgoal.status} />
                                </div>
                                <span className="text-xs font-mono">{subgoal.progress.toFixed(0)}%</span>
                              </div>
                              <div className="relative h-1 w-full overflow-hidden rounded-full bg-primary/20">
                                <motion.div
                                  className="h-full rounded-full bg-gradient-to-r from-nagual-purple to-nagual-cyan opacity-70"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, Math.max(0, subgoal.progress))}%` }}
                                  transition={{ duration: 0.6, ease: 'easeOut' }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </motion.div>
              </CollapsibleContent>
            )}
          </AnimatePresence>
        </Card>
      </Collapsible>
    </motion.div>
  )
}

export function GoalsTab() {
  const { data, isLoading } = useGoals()

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-xl border border-border bg-card animate-pulse" />
        ))}
      </div>
    )
  }

  const { tree, goals } = data

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-4 h-4 text-nagual-purple" />
              Goals Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-nagual-purple/5 border border-nagual-purple/10">
                <p className="text-2xl font-bold font-mono text-nagual-purple">{tree.active}</p>
                <p className="text-xs text-muted-foreground mt-1">Active</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-nagual-green/5 border border-nagual-green/10">
                <p className="text-2xl font-bold font-mono text-nagual-green">{tree.completed}</p>
                <p className="text-xs text-muted-foreground mt-1">Completed</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-2xl font-bold font-mono">{tree.total}</p>
                <p className="text-xs text-muted-foreground mt-1">Total</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground">Avg Progress</p>
                  <p className="text-sm font-mono font-bold">{tree.avg_progress.toFixed(0)}%</p>
                </div>
                <GradientProgress value={tree.avg_progress} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Goals List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="w-4 h-4 text-nagual-cyan" />
              All Goals
              <Badge variant="outline" className="ml-auto">{goals.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              {goals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Target className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No goals defined yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {goals.map((goal, idx) => (
                    <GoalCard key={goal.id} goal={goal} index={idx} />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
