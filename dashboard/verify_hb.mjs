import { chromium } from 'playwright-core'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const b = await chromium.launch({ executablePath: CHROME, headless: true })
const p = await b.newPage({ viewport: { width: 1280, height: 900 } })
const errs = []
p.on('pageerror', e => errs.push(e.message))
p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()) })
await p.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(1000)
try { await p.getByRole('button', { name: 'RU', exact: true }).click(); await p.waitForTimeout(500) } catch {}
// heartbeat = nav index 8
await p.locator('nav button').nth(8).click()
await p.waitForTimeout(1600)
const body = await p.evaluate(() => document.body.innerText)
console.log('errs:', errs.length ? errs : 0)
console.log('RU "Всего пульсов":', body.includes('Всего пульсов'))
console.log('RU "Система Anti-Death":', body.includes('Система Anti-Death'))
console.log('RU "Метрики тайминга":', body.includes('Метрики тайминга'))
await b.close()
