'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Sparkles, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useT } from '@/lib/i18n'

interface MentorMessage {
  who: string
  text: string
  ts: string
}

const POLL_MS = 7000

export default function MentorTab() {
  const t = useT()
  const [messages, setMessages] = useState<MentorMessage[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const res = await fetch('/api/nagual/mentor/log')
        if (!res.ok) return
        const data = await res.json()
        if (alive && Array.isArray(data.messages)) {
          setMessages(data.messages)
          setTotal(data.total ?? data.messages.length)
        }
      } catch {
        /* backend offline — keep last view */
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    const id = setInterval(load, POLL_MS)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const isMentor = (who: string) => who.toLowerCase().includes('ментор') || who.toLowerCase().includes('mentor')

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="hover:border-nagual-purple/30 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-nagual-purple" />
                {t('mentor.title')}
              </span>
              <span className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {total} {t('mentor.messages')}
                </Badge>
                {loading && <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground" />}
              </span>
            </CardTitle>
            <p className="text-xs text-muted-foreground">{t('mentor.subtitle')}</p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-260px)] pr-3 chat-scroll">
              {messages.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground text-center py-10">{t('mentor.empty')}</p>
              )}
              <div className="space-y-3">
                {messages.map((m, i) => (
                  <div
                    key={`${m.ts}-${i}`}
                    className={`max-w-[85%] rounded-lg border px-3 py-2 ${
                      isMentor(m.who)
                        ? 'ml-auto bg-nagual-purple/10 border-nagual-purple/20'
                        : 'mr-auto bg-nagual-cyan/5 border-nagual-cyan/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {isMentor(m.who) ? (
                        <GraduationCap className="w-3 h-3 text-nagual-purple" />
                      ) : (
                        <Sparkles className="w-3 h-3 text-nagual-cyan" />
                      )}
                      <span className="text-xs font-semibold">{m.who}</span>
                      <span className="text-[10px] text-muted-foreground font-mono ml-auto">
                        {new Date(m.ts).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>
              <div ref={bottomRef} />
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
