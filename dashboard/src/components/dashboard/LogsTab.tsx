'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FileText, Filter, Info, AlertTriangle, Bug } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLogs } from '@/hooks/useNagualAPI'

type LogLevel = 'all' | 'info' | 'warn' | 'debug'

function LevelBadge({ level }: { level: string }) {
  switch (level) {
    case 'info':
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-mono text-[10px]">
          INFO
        </Badge>
      )
    case 'warn':
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 font-mono text-[10px]">
          WARN
        </Badge>
      )
    case 'debug':
      return (
        <Badge className="bg-gray-100 text-gray-600 border-gray-200 font-mono text-[10px]">
          DEBUG
        </Badge>
      )
    case 'error':
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 font-mono text-[10px]">
          ERROR
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="font-mono text-[10px]">
          {level.toUpperCase()}
        </Badge>
      )
  }
}

const FILTERS: { value: LogLevel; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All', icon: <FileText className="w-3 h-3" /> },
  { value: 'info', label: 'Info', icon: <Info className="w-3 h-3" /> },
  { value: 'warn', label: 'Warn', icon: <AlertTriangle className="w-3 h-3" /> },
  { value: 'debug', label: 'Debug', icon: <Bug className="w-3 h-3" /> },
]

export function LogsTab() {
  const { data, isLoading } = useLogs()
  const [activeFilter, setActiveFilter] = useState<LogLevel>('all')
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevTotalRef = useRef(0)

  const lines = data?.lines || []

  const filteredLines = activeFilter === 'all'
    ? lines
    : lines.filter((line) => line.level.toLowerCase() === activeFilter)

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    if (scrollRef.current && data && data.total > prevTotalRef.current) {
      const viewport = scrollRef.current.querySelector('[data-slot="scroll-area-viewport"]')
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      }
    }
    prevTotalRef.current = data?.total || 0
  }, [data?.total])

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="h-24 rounded-xl border border-border bg-card animate-pulse" />
        <div className="h-96 rounded-xl border border-border bg-card animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-nagual-purple/10 to-nagual-cyan/10">
              <FileText className="w-5 h-5 text-nagual-purple" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Log Lines</p>
              <p className="text-2xl font-bold font-mono">{data.total.toLocaleString()}</p>
            </div>
            <Badge variant="outline" className="ml-auto">
              Showing {filteredLines.length}
            </Badge>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filter + Log Viewer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-4 h-4 text-nagual-purple" />
                System Logs
              </CardTitle>
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1" />
                {FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setActiveFilter(filter.value)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      activeFilter === filter.value
                        ? 'bg-gradient-to-r from-nagual-purple to-nagual-cyan text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {filter.icon}
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[520px] pr-4" ref={scrollRef}>
              {filteredLines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <FileText className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No log entries match the filter</p>
                </div>
              ) : (
                <div className="space-y-1 font-mono text-xs">
                  {filteredLines.map((line, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-start gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors group"
                    >
                      <span className="text-muted-foreground whitespace-nowrap opacity-70 group-hover:opacity-100 transition-opacity">
                        {line.timestamp}
                      </span>
                      <LevelBadge level={line.level} />
                      <span className="text-nagual-purple whitespace-nowrap font-semibold">
                        [{line.module}]
                      </span>
                      <span className="text-foreground break-all leading-relaxed">
                        {line.message}
                      </span>
                    </motion.div>
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
