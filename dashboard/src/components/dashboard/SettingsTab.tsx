'use client'

import { useSettings } from '@/hooks/useNagualAPI'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion } from 'framer-motion'
import { Key, GitBranch, Webhook, Heart, ShieldCheck } from 'lucide-react'

export default function SettingsTab() {
  const { data, isLoading } = useSettings()

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 rounded-xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* API Keys */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Key className="w-4 h-4 text-nagual-purple" />
              API Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-80">
              <div className="space-y-2">
                {Object.entries(data.keys).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3 py-1.5">
                    <code className="text-xs font-mono text-muted-foreground min-w-[200px] truncate">
                      {key}
                    </code>
                    <Input
                      value={value}
                      readOnly
                      className="h-7 text-xs font-mono bg-muted/30"
                    />
                    {value && value.length > 4 ? (
                      <Badge variant="secondary" className="text-[10px] bg-nagual-green/10 text-nagual-green">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] bg-nagual-red/10 text-nagual-red">
                        Empty
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-nagual-cyan" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">GitHub Repository</p>
                <Input value={data.github_repo} readOnly className="text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Webhook URL</p>
                <Input value={data.webhook_url} readOnly className="text-sm font-mono text-xs" />
              </div>
              <Separator />
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">SOUL.md Hash</p>
                <code className="text-xs font-mono text-muted-foreground break-all">
                  {data.soul_hash}
                </code>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* SOUL.md */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Heart className="w-4 h-4 text-nagual-purple" />
                SOUL.md
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
                <p className="text-sm text-foreground leading-relaxed">
                  {data.soul}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Rules */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-nagual-green" />
                Core Rules ({data.rules.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-64">
                <div className="space-y-2">
                  {data.rules.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2 py-1.5 px-2 rounded-md hover:bg-muted/30 transition-colors">
                      <span className="text-xs font-mono text-nagual-purple mt-0.5 flex-shrink-0">{String(idx + 1).padStart(2, '0')}</span>
                      <p className="text-xs text-foreground">{rule}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Goals */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Webhook className="w-4 h-4 text-nagual-orange" />
                Strategic Goals ({data.goals.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-64">
                <div className="space-y-2">
                  {data.goals.map((goal, idx) => (
                    <div key={idx} className="flex items-start gap-2 py-1.5 px-2 rounded-md hover:bg-muted/30 transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-nagual-purple to-nagual-cyan mt-1.5 flex-shrink-0" />
                      <p className="text-xs text-foreground">{goal}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
