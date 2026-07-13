'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useT } from '@/lib/i18n'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const t = useT()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch: render only after mount.
  useEffect(() => setMounted(true), [])
  if (!mounted) {
    return <div className="w-8 h-8" aria-hidden />
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? t('control.theme.toLight') : t('control.theme.toDark')}
      title={isDark ? t('control.theme.toLight') : t('control.theme.toDark')}
      className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}
