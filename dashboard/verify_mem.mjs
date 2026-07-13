import { chromium } from 'playwright-core'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const OUT = 'C:\\Users\\Farmer-9\\AppData\\Local\\Temp\\nagual_e2e'
const b = await chromium.launch({ executablePath: CHROME, headless: true })
const p = await b.newPage({ viewport: { width: 1280, height: 900 } })
const errs = []
p.on('pageerror', e => errs.push(e.message))
p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()) })
await p.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(1500)
// switch to RU first
try { await p.getByRole('button', { name: 'RU', exact: true }).click(); await p.waitForTimeout(600) } catch {}
// Memory = nav index 3 (mind,toltec,meta,memory)
await p.locator('nav button').nth(3).click()
await p.waitForTimeout(1800)
const body = await p.evaluate(() => document.body.innerText)
console.log('pageerrors:', errs.length ? errs : 'NONE')
console.log('RU "Всего ячеек":', body.includes('Всего ячеек'))
console.log('RU "Резонансная память":', body.includes('Резонансная память'))
console.log('RU "Перепросмотр":', body.includes('Перепросмотр'))
console.log('still EN "Total Cells":', body.includes('Total Cells'))
await p.screenshot({ path: `${OUT}\\memory_ru.png` })
await b.close()
