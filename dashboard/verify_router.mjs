import { chromium } from 'playwright-core'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const OUT = 'C:\\Users\\Farmer-9\\AppData\\Local\\Temp\\nagual_e2e'
const b = await chromium.launch({ executablePath: CHROME, headless: true })
const p = await b.newPage({ viewport: { width: 1280, height: 1100 } })
const errs = []
p.on('pageerror', e => errs.push(e.message))
p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()) })

await p.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(1500)
// LLM tab = nav index 4 (mind,toltec,meta,memory,llm)
await p.locator('nav button').nth(4).click()
await p.waitForTimeout(2500) // allow RouterPanel to fetch keys+slots
const body = await p.evaluate(() => document.body.innerText)
console.log('pageerrors:', errs.length ? errs : 'NONE')
console.log('has Router title:', /LLM Router|LLM-роутер/.test(body))
console.log('has Key Pool:', /Key Pool|Пул ключей/.test(body))
console.log('has openrouter key:', /openrouter/.test(body))
console.log('has PRIMARY badge:', /PRIMARY|ОСНОВНОЙ/.test(body))
console.log('has kimi slot:', /kimi/.test(body))
await p.screenshot({ path: `${OUT}\\router_panel.png`, fullPage: true })
await b.close()
