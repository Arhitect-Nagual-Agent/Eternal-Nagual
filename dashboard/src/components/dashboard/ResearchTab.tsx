'use client'

import { motion } from 'framer-motion'
import { FlaskConical, BookOpen, Search, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useResearch } from '@/hooks/useNagualAPI'

function GradientProgress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={`relative h-1.5 w-full overflow-hidden rounded-full bg-primary/20 ${className || ''}`}>
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-nagual-purple to-nagual-cyan"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  )
}

function DepthBadge({ depth }: { depth: string }) {
  switch (depth) {
    case 'deep':
      return (
        <Badge className="bg-gradient-to-r from-nagual-purple to-nagual-cyan text-white border-0">
          Deep
        </Badge>
      )
    case 'medium':
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
          Medium
        </Badge>
      )
    case 'shallow':
      return (
        <Badge className="bg-gray-100 text-gray-600 border-gray-200">
          Shallow
        </Badge>
      )
    default:
      return <Badge variant="outline">{depth}</Badge>
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

export function ResearchTab() {
  const { data, isLoading } = useResearch()

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

  const entries = [...data.log].reverse()

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-nagual-purple/10 to-nagual-cyan/10">
              <FlaskConical className="w-5 h-5 text-nagual-purple" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Researches</p>
              <p className="text-2xl font-bold font-mono">{data.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-nagual-purple/10 to-nagual-cyan/10">
              <BookOpen className="w-5 h-5 text-nagual-cyan" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Last Topic</p>
              <p className="text-sm font-medium truncate max-w-[200px]">{data.last_topic || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-nagual-purple/10 to-nagual-cyan/10">
              <Search className="w-5 h-5 text-nagual-green" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Researches Count</p>
              <p className="text-2xl font-bold font-mono">{data.researches}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Research Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="w-4 h-4 text-nagual-purple" />
              Research Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[480px] pr-4">
              {entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Search className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No research entries yet</p>
                </div>
              ) : (
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-3"
                >
                  {entries.map((entry, idx) => (
                    <motion.div
                      key={idx}
                      variants={item}
                      className="rounded-lg border border-border p-4 hover:border-nagual-purple/30 transition-all duration-200 bg-white"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground font-mono">{entry.timestamp}</span>
                          <DepthBadge depth={entry.depth} />
                        </div>
                      </div>

                      <h4 className="text-sm font-semibold text-foreground mb-2">{entry.topic}</h4>

                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                        {entry.findings}
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">Confidence</span>
                          <div className="flex-1">
                            <GradientProgress value={entry.confidence * 100} />
                          </div>
                          <span className="text-xs font-mono font-medium">{(entry.confidence * 100).toFixed(0)}%</span>
                        </div>

                        {entry.action_taken && (
                          <div className="flex items-center gap-1.5">
                            <ArrowRight className="w-3 h-3 text-nagual-purple" />
                            <span className="text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">Action:</span> {entry.action_taken}
                            </span>
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
    </div>
  )
}
