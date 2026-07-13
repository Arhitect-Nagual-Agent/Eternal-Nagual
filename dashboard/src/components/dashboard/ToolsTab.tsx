'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wrench, ArrowUpRight, ShieldCheck, ShieldAlert, ShieldOff, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useTools } from '@/hooks/useNagualAPI'
import type { ToolInfo } from '@/lib/types'

const TOOL_CATEGORIES = [
  'memory',
  'knowledge',
  'evolution',
  'research',
  'toltec',
  'safety',
  'swarm',
  'system',
  'goals',
  'interaction',
  'meta',
  'meaning',
]

const CATEGORY_COLORS: Record<string, string> = {
  memory: 'bg-purple-100 text-purple-700 border-purple-200',
  knowledge: 'bg-blue-100 text-blue-700 border-blue-200',
  evolution: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  research: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  toltec: 'bg-amber-100 text-amber-700 border-amber-200',
  safety: 'bg-red-100 text-red-700 border-red-200',
  swarm: 'bg-teal-100 text-teal-700 border-teal-200',
  system: 'bg-gray-100 text-gray-700 border-gray-200',
  goals: 'bg-orange-100 text-orange-700 border-orange-200',
  interaction: 'bg-pink-100 text-pink-700 border-pink-200',
  meta: 'bg-violet-100 text-violet-700 border-violet-200',
  meaning: 'bg-indigo-100 text-indigo-700 border-indigo-200',
}

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category.toLowerCase()] || 'bg-gray-100 text-gray-600 border-gray-200'
}

function SafetyBadge({ safety }: { safety: string }) {
  switch (safety) {
    case 'safe':
      return (
        <Badge className="bg-nagual-green/10 text-nagual-green border-nagual-green/20">
          <ShieldCheck className="w-3 h-3 mr-1" />
          Safe
        </Badge>
      )
    case 'guarded':
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
          <ShieldAlert className="w-3 h-3 mr-1" />
          Guarded
        </Badge>
      )
    case 'critical':
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          <ShieldOff className="w-3 h-3 mr-1" />
          Critical
        </Badge>
      )
    default:
      return <Badge variant="outline">{safety}</Badge>
  }
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
}

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 },
}

export function ToolsTab() {
  const { data, isLoading } = useTools()
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const parsedTools = useMemo(() => {
    if (!data) return []
    return Object.entries(data).map(([name, info]) => ({
      name,
      ...info,
    }))
  }, [data])

  const filteredTools = useMemo(() => {
    if (activeFilter === 'all') return parsedTools
    return parsedTools.filter((t) => t.category.toLowerCase() === activeFilter.toLowerCase())
  }, [parsedTools, activeFilter])

  const stats = useMemo(() => {
    const totalCalls = parsedTools.reduce((sum, t) => sum + t.calls, 0)
    const byCategory: Record<string, number> = {}
    for (const t of parsedTools) {
      const cat = t.category || 'unknown'
      byCategory[cat] = (byCategory[cat] || 0) + 1
    }
    return { totalTools: parsedTools.length, totalCalls, byCategory }
  }, [parsedTools])

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
        <div className="h-96 rounded-xl border border-border bg-card animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-nagual-purple/10 to-nagual-cyan/10">
              <Wrench className="w-5 h-5 text-nagual-purple" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Tools</p>
              <p className="text-2xl font-bold font-mono">{stats.totalTools}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-nagual-purple/10 to-nagual-cyan/10">
              <ArrowUpRight className="w-5 h-5 text-nagual-cyan" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Calls</p>
              <p className="text-2xl font-bold font-mono">{stats.totalCalls.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-nagual-purple/10 to-nagual-cyan/10">
              <Filter className="w-5 h-5 text-nagual-green" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Categories</p>
              <p className="text-2xl font-bold font-mono">{Object.keys(stats.byCategory).length}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground mr-1" />
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  activeFilter === 'all'
                    ? 'bg-gradient-to-r from-nagual-purple to-nagual-cyan text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                All ({stats.totalTools})
              </button>
              {TOOL_CATEGORIES.map((cat) => {
                const count = stats.byCategory[cat] || 0
                if (count === 0) return null
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 capitalize ${
                      activeFilter === cat
                        ? 'bg-gradient-to-r from-nagual-purple to-nagual-cyan text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tool Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wrench className="w-4 h-4 text-nagual-purple" />
              Tool Registry
              <Badge variant="outline" className="ml-auto">{filteredTools.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[520px] pr-4">
              {filteredTools.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Wrench className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No tools found in this category</p>
                </div>
              ) : (
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  {filteredTools.map((tool) => (
                    <motion.div
                      key={tool.name}
                      variants={item}
                      className="rounded-lg border border-border p-4 hover:border-nagual-purple/30 transition-all duration-200 bg-white"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-bold font-mono text-foreground break-all">
                          {tool.name}
                        </h4>
                        <SafetyBadge safety={tool.safety} />
                      </div>

                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-2">
                        {tool.desc}
                      </p>

                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <Badge className={`text-[10px] ${getCategoryColor(tool.category)}`}>
                          {tool.category}
                        </Badge>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" />
                            <span className="font-mono">{tool.calls}</span>
                          </span>
                          <span className="font-mono">{tool.last_used}</span>
                        </div>
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
  )
}
