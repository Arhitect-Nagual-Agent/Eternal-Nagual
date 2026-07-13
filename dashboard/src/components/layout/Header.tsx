'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { useT } from '@/lib/i18n'

export function Header() {
  const t = useT()
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const utc = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
      setTime(utc)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="sticky top-0 z-50 glass gradient-border-bottom">
      <div className="gradient-line" />
      <div className="flex items-center justify-between px-4 lg:px-6 h-14">
        {/* Left side: Logo + Title + Subtitle */}
        <div className="flex items-center gap-3">
          <img
            src="/nagual-avatar.jpg"
            alt="Nagual"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-primary/40"
          />
          <div className="min-w-0">
            <h1 className="text-sm font-bold gradient-text tracking-wide">
              {t('header.title')}
            </h1>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase hidden sm:block">
              {t('header.subtitle')}
            </p>
          </div>
        </div>

        {/* Right side: Controls + Status + Clock */}
        <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
          <LanguageToggle />
          <ThemeToggle />
          <StatusBadge status="online" />
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
            <Clock className="w-3 h-3" />
            <span>{time}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
