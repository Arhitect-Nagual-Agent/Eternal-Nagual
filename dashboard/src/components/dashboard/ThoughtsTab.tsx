'use client'

import { motion } from 'framer-motion'
import { Brain, Star, Tag, Clock, Hash } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useThoughts } from '@/hooks/useNagualAPI'

const CATEGORY_COLORS: Record<string, string> = {
  reflection: 'bg-purple-100 text-purple-700 border-purple-200',
  analysis: 'bg-blue-100 text-blue-700 border-blue-200',
  creativity: 'bg-pink-100 text-pink-700 border-pink-200',
  planning: 'bg-orange-100 text-orange-700 border-orange-200',
  awareness: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  emotion: 'bg-rose-100 text-rose-700 border-rose-200',
  memory: 'bg-amber-100 text-amber-700 border-amber-200',
  insight: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  meta: 'bg-violet-100 text-violet-700 border-violet-200',
  emergence: 'bg-teal-100 text-teal-700 border-teal-200',
}

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category.toLowerCase()] || 'bg-gray-100 text-gray-600 border-gray-200'
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export function ThoughtsTab() {
  const { data, isLoading } = useThoughts()

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="h-32 rounded-xl border border-border bg-card animate-pulse" />
        <div className="h-48 rounded-xl border border-border bg-card animate-pulse" />
        <div className="h-96 rounded-xl border border-border bg-card animate-pulse" />
      </div>
    )
  }

  const { summary, recent } = data
  const categoryEntries = Object.entries(summary.categories).sort((a, b) => b[1] - a[1])
  const maxCategoryCount = categoryEntries.length > 0 ? categoryEntries[0][1] : 1

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
              <Brain className="w-4 h-4 text-nagual-purple" />
              Thought Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-nagual-purple/5 border border-nagual-purple/10">
                <p className="text-3xl font-bold font-mono text-nagual-purple">{summary.total}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Thoughts</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-nagual-cyan/5 border border-nagual-cyan/10">
                <p className="text-3xl font-bold font-mono text-nagual-cyan">{summary.avg_importance.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground mt-1">Avg Importance</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-lg font-bold text-foreground capitalize">{summary.dominant_category || 'N/A'}</p>
                <p className="text-xs text-muted-foreground mt-1">Dominant Category</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Hash className="w-4 h-4 text-nagual-cyan" />
              Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No category data available</p>
            ) : (
              <div className="space-y-3">
                {categoryEntries.map(([category, count]) => (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{category}</span>
                      <span className="text-sm font-mono text-muted-foreground">{count}</span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-nagual-purple to-nagual-cyan"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(100, (count / maxCategoryCount) * 100)}%`,
                        }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Thoughts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="w-4 h-4 text-nagual-purple" />
              Recent Thoughts
              <Badge variant="outline" className="ml-auto">{recent.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[480px] pr-4">
              {recent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Brain className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No thoughts recorded yet</p>
                </div>
              ) : (
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-3"
                >
                  {recent.map((thought, idx) => (
                    <motion.div
                      key={idx}
                      variants={item}
                      className="rounded-lg border border-border p-4 hover:border-nagual-purple/30 transition-all duration-200 bg-white"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`text-xs ${getCategoryColor(thought.category)}`}>
                            {thought.category}
                          </Badge>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: Math.min(5, Math.round(thought.importance)) }).map((_, i) => (
                              <Star
                                key={i}
                                className="w-3 h-3 text-amber-400 fill-amber-400"
                              />
                            ))}
                            {Array.from({ length: 5 - Math.min(5, Math.round(thought.importance)) }).map((_, i) => (
                              <Star
                                key={`empty-${i}`}
                                className="w-3 h-3 text-gray-200"
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                          {thought.timestamp}
                        </span>
                      </div>

                      <p className="text-sm text-foreground leading-relaxed mb-3">
                        {thought.content.length > 300
                          ? thought.content.slice(0, 300) + '...'
                          : thought.content}
                      </p>

                      {thought.tags && thought.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Tag className="w-3 h-3 text-muted-foreground" />
                          {thought.tags.map((tag, tagIdx) => (
                            <Badge key={tagIdx} variant="outline" className="text-[10px] px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
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
