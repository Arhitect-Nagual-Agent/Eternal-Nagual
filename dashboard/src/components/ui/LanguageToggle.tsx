'use client'

import { useI18n } from '@/lib/i18n'

// Simple EN | RU segmented toggle. Default is EN.
export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n()

  return (
    <div
      className="flex items-center rounded-md border border-border/60 overflow-hidden text-[11px] font-semibold"
      role="group"
      aria-label={t('control.lang')}
    >
      {(['en', 'ru'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={
            'px-2 py-1 transition-colors ' +
            (locale === l
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60')
          }
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
