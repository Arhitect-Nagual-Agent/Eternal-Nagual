'use client'

// /account — личный кабинет юзера Витрины (ТЗ B-2/B-4): баланс поинтов, реферальная
// ссылка (структура под бинарный маркетинг Кости), тариф Early Access, язык/тема.
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PubProvider, PubHeader, usePub, t, THEMES } from '@/lib/pubui'

interface Me { id: string; email: string; points: number; plan: string; created: string }

function AccountInner() {
  const { lang, theme } = usePub()
  const T = THEMES[theme]
  const router = useRouter()
  const [me, setMe] = useState<Me | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/pub/me').then(async r => {
      if (!r.ok) { router.replace('/join'); return }
      setMe(await r.json())
    }).catch(() => router.replace('/join'))
  }, [router])

  const logout = async () => {
    await fetch('/api/pub/logout', { method: 'POST' })
    router.replace('/join')
  }
  const refLink = me ? `${typeof window !== 'undefined' ? window.location.origin : ''}/join?ref=${me.id}` : ''
  const copyRef = () => {
    navigator.clipboard?.writeText(refLink).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const panel: React.CSSProperties = { background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 16, padding: '22px 24px' }
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'system-ui, sans-serif' }}>
      <PubHeader right={
        <Link href="/watch" style={{ fontSize: 12, color: T.accent, textDecoration: 'none', border: `1px solid ${T.panelBorder}`, borderRadius: 8, padding: '4px 10px' }}>
          {t('toWatch', lang)}
        </Link>
      } />
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 26 }}>{t('account', lang)}</h1>
        {me && (
          <>
            <section style={panel}>
              <div style={{ fontSize: 12, color: T.sub }}>{me.email}</div>
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontSize: 42, fontWeight: 800, background: T.btn, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{me.points}</span>
                <span style={{ fontSize: 15, color: T.sub }}>{t('points', lang)}</span>
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: T.sub }}>{t('pointsHint', lang)}</div>
            </section>
            <section style={panel}>
              <div style={{ fontSize: 12, color: T.sub, letterSpacing: 1 }}>{t('plan', lang)}</div>
              <div style={{ marginTop: 8, fontSize: 15, fontWeight: 600, color: T.accent }}>🌱 {t('earlyAccess', lang)}</div>
            </section>
            <section style={panel}>
              <div style={{ fontSize: 12, color: T.sub, letterSpacing: 1 }}>{t('referral', lang)}</div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <input readOnly value={refLink} style={{
                  flex: 1, padding: '9px 12px', borderRadius: 9, fontSize: 12.5,
                  background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text,
                }} />
                <button onClick={copyRef} style={{ cursor: 'pointer', padding: '9px 16px', borderRadius: 9, border: 'none', background: T.btn, color: T.btnText, fontSize: 12.5, fontWeight: 700 }}>
                  {copied ? t('copied', lang) : t('copy', lang)}
                </button>
              </div>
            </section>
            <button onClick={logout} style={{ alignSelf: 'flex-start', cursor: 'pointer', padding: '8px 18px', borderRadius: 9, fontSize: 13, background: 'transparent', border: `1px solid ${T.panelBorder}`, color: T.sub }}>
              {t('logout', lang)}
            </button>
          </>
        )}
      </main>
    </div>
  )
}

export default function AccountPage() {
  return (
    <PubProvider>
      <AccountInner />
    </PubProvider>
  )
}
