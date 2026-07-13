import { chromium } from 'playwright-core'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const b = await chromium.launch({ executablePath: CHROME, headless: true })
// tabs to check by nav index + a RU marker string expected
const checks = [
  { i: 0, name: 'mind', ru: 'Точка сборки' },
  { i: 2, name: 'meta', ru: 'Снимок сознания' },
  { i: 3, name: 'memory', ru: 'Резонансная память' },
]
let fail = 0
for (const c of checks) {
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } })
  const errs = []
  p.on('pageerror', e => errs.push(e.message))
  p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()) })
  await p.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(1000)
  try { await p.getByRole('button', { name: 'RU', exact: true }).click(); await p.waitForTimeout(500) } catch {}
  await p.locator('nav button').nth(c.i).click()
  await p.waitForTimeout(1600)
  const body = await p.evaluate(() => document.body.innerText)
  const ruOk = body.includes(c.ru)
  const bad = errs.length > 0 || !ruOk
  if (bad) fail++
  console.log(`[${bad ? 'FAIL' : 'ok  '}] ${c.name}  RU(${c.ru}):${ruOk}  errs:${errs.length ? errs.join('|') : 0}`)
  await p.close()
}
await b.close()
console.log(`\n${fail} fail / ${checks.length}`)
