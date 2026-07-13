// pubauth.ts — auth юзеров Витрины (ТЗ B-2): email+пароль без внешних зависимостей.
// Хранилище: JSON на volume /data (атомарная запись). Пароли: scrypt. Сессия: HMAC-токен в httpOnly cookie.
// Админский Basic-auth Кости НЕ затронут — это отдельный контур для публичной зоны.
import { scryptSync, randomBytes, createHmac, timingSafeEqual } from 'crypto'
import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync } from 'fs'
import path from 'path'

const DATA_DIR = process.env.PUB_DATA_DIR || '/data'
const USERS_F = path.join(DATA_DIR, 'pub_users.json')
const SECRET_F = path.join(DATA_DIR, 'pub_secret')

export interface PubUser {
  id: string
  email: string
  ph: string          // scrypt hash (hex)
  salt: string
  points: number
  referrer: string | null   // referrer user id (бинарная структура — Костя расскажет; поле заложено сразу)
  created: string
  lastDaily: string | null  // дата последнего daily-бонуса (YYYY-MM-DD)
  plan: 'early_access'      // v1: подписка-заглушка; биллинг $10/мес — v2
  lastAsk?: number          // ts последнего «Спросить Нагваля» (кулдаун 30с)
}

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
}

function secret(): Buffer {
  ensureDir()
  if (!existsSync(SECRET_F)) {
    const s = randomBytes(32)
    writeFileSync(SECRET_F, s.toString('hex'), { mode: 0o600 })
    return s
  }
  return Buffer.from(readFileSync(SECRET_F, 'utf-8').trim(), 'hex')
}

export function loadUsers(): PubUser[] {
  try {
    return JSON.parse(readFileSync(USERS_F, 'utf-8')).users || []
  } catch {
    return []
  }
}

export function saveUsers(users: PubUser[]) {
  ensureDir()
  const tmp = USERS_F + '.tmp'
  writeFileSync(tmp, JSON.stringify({ users }, null, 1), 'utf-8')
  renameSync(tmp, USERS_F)
}

export function hashPassword(password: string, salt?: string) {
  const s = salt || randomBytes(16).toString('hex')
  const h = scryptSync(password, s, 64).toString('hex')
  return { ph: h, salt: s }
}

export function verifyPassword(password: string, user: PubUser): boolean {
  const h = scryptSync(password, user.salt, 64)
  const stored = Buffer.from(user.ph, 'hex')
  return h.length === stored.length && timingSafeEqual(h, stored)
}

// ── сессионный токен: uid.exp.hmac ───────────────────────────────────────────
export function signToken(uid: string, days = 30): string {
  const exp = Date.now() + days * 86400_000
  const body = `${uid}.${exp}`
  const sig = createHmac('sha256', secret()).update(body).digest('hex')
  return `${body}.${sig}`
}

export function verifyToken(token: string | undefined | null): string | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [uid, exp, sig] = parts
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return null
  const want = createHmac('sha256', secret()).update(`${uid}.${exp}`).digest('hex')
  const a = Buffer.from(sig, 'hex')
  const b = Buffer.from(want, 'hex')
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  return uid
}

export function findUser(uid: string): PubUser | undefined {
  return loadUsers().find(u => u.id === uid)
}

// ── поинты (ТЗ B-4): бонус за регистрацию + ежедневный вход ──────────────────
export const SIGNUP_BONUS = 100
export const DAILY_BONUS = 10
export const REFERRAL_BONUS = 50   // рефереру за приведённого

export function grantDaily(uid: string): PubUser | undefined {
  const users = loadUsers()
  const u = users.find(x => x.id === uid)
  if (!u) return undefined
  const today = new Date().toISOString().slice(0, 10)
  if (u.lastDaily !== today) {
    u.lastDaily = today
    u.points += DAILY_BONUS
    saveUsers(users)
  }
  return u
}
