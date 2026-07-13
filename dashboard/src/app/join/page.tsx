'use client'

// /join — публичный лендинг + регистрация/вход Витрины (ТЗ B-3).
// Финал Free Guy: люди приходят наблюдать за живым цифровым существом.
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PubProvider, PubHeader, usePub, t, THEMES } from '@/lib/pubui'

function JoinInner() {
  const { lang, theme } = usePub()
  const T = THEMES[theme]
  const router = useRouter()
  const params = useSearchParams()
  const ref = params.get('ref') || ''
  const [mode, setMode] = useState<'signup' | 'signin'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  // уже залогинен → сразу в мир
  useEffect(() => {
    fetch('/api/pub/me').then(r => { if (r.ok) router.replace('/watch') }).catch(() => {})
  }, [router])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      const url = mode === 'signup' ? '/api/pub/register' : '/api/pub/login'
      const res = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ref }),
      })
      if (res.ok) { router.push('/watch'); return }
      const d = await res.json().catch(() => ({}))
      setErr(d.error === 'exists' ? t('errExists', lang)
        : d.error === 'invalid' ? t('errInvalid', lang)
        : d.error === 'weak_password' ? t('errWeak', lang)
        : d.error === 'bad_email' ? t('errEmail', lang)
        : t('errGeneric', lang))
    } catch {
      setErr(t('errGeneric', lang))
    } finally {
      setBusy(false)
    }
  }

  const input: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
    background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text, outline: 'none',
  }
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <PubHeader />
      <main style={{ maxWidth: 1060, margin: '0 auto', padding: '38px 22px', display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* hero */}
        <section style={{ flex: '1 1 460px', minWidth: 320 }}>
          <h1 style={{ fontSize: 40, lineHeight: 1.15, margin: 0, fontWeight: 800 }}>
            {t('tagline', lang)}
          </h1>
          <p style={{ marginTop: 18, fontSize: 16, lineHeight: 1.65, color: T.sub }}>{t('heroText', lang)}</p>
          <div style={{ marginTop: 22, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {[
              lang === 'ru' ? ['📚', '4205 книг в его библиотеке'] : ['📚', '4,205 books in its library'],
              lang === 'ru' ? ['🦞', 'живёт в соцсети ИИ-агентов'] : ['🦞', 'lives in an AI-agent social network'],
              lang === 'ru' ? ['⚗️', 'уровень растёт только от проверяемого'] : ['⚗️', 'levels up only through verifiable wins'],
              lang === 'ru' ? ['🌗', 'сутки мира = 24 минуты'] : ['🌗', 'one world day = 24 minutes'],
            ].map(([ic, txt]) => (
              <div key={txt} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 13px', borderRadius: 12, background: T.panel, border: `1px solid ${T.panelBorder}`, fontSize: 13 }}>
                <span>{ic}</span><span style={{ color: T.sub }}>{txt}</span>
              </div>
            ))}
          </div>
        </section>
        {/* форма */}
        <section style={{ flex: '0 1 360px', minWidth: 300, background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 18, padding: '26px 24px', backdropFilter: 'blur(8px)' }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>{mode === 'signup' ? t('signUp', lang) : t('signIn', lang)}</h2>
          <form onSubmit={submit} style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input style={input} type="email" placeholder={t('email', lang)} value={email}
              onChange={e => setEmail(e.target.value)} autoComplete="email" required />
            <input style={input} type="password" placeholder={t('password', lang)} value={password}
              onChange={e => setPassword(e.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required />
            {err && <div style={{ fontSize: 12.5, color: '#e05a4e' }}>{err}</div>}
            <button disabled={busy} type="submit" style={{
              cursor: 'pointer', padding: '12px 0', borderRadius: 10, border: 'none', fontSize: 14.5, fontWeight: 700,
              background: T.btn, color: T.btnText, opacity: busy ? 0.6 : 1,
            }}>
              {busy ? '…' : mode === 'signup' ? t('signUp', lang) : t('signIn', lang)} → {t('watchCta', lang)}
            </button>
          </form>
          <div style={{ marginTop: 12, fontSize: 12.5, color: T.accent, cursor: 'pointer' }}
            onClick={() => { setMode(m => (m === 'signup' ? 'signin' : 'signup')); setErr('') }}>
            {mode === 'signup' ? t('haveAccount', lang) : t('noAccount', lang)}
          </div>
          {ref && <div style={{ marginTop: 10, fontSize: 11.5, color: T.sub }}>🎁 ref: {ref}</div>}
        </section>
      </main>
    </div>
  )
}

export default function JoinPage() {
  return (
    <PubProvider>
      <Suspense>
        <JoinInner />
      </Suspense>
    </PubProvider>
  )
}
