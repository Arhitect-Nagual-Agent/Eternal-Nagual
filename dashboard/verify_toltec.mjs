import { chromium } from 'playwright-core'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const OUT = 'C:\\Users\\Farmer-9\\AppData\\Local\\Temp\\nagual_e2e'
const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 860 } })
const errs = []
page.on('pageerror', (e) => errs.push('pageerror: ' + e.message))
page.on('console', (m) => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()) })

await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1200)
// Toltec is nav index 1
await page.locator('nav button').nth(1).click()
await page.waitForTimeout(1500)
await page.screenshot({ path: `${OUT}\\toltec_en.png` })
const enText = await page.evaluate(() => document.body.innerText)

// switch to RU
await page.getByRole('button', { name: 'RU', exact: true }).click()
await page.waitForTimeout(1200)
await page.screenshot({ path: `${OUT}\\toltec_ru.png` })
const ruText = await page.evaluate(() => document.body.innerText)

await browser.close()

console.log('errors:', errs.length ? errs : 'NONE')
console.log('EN has "Assembly Point":', enText.includes('Assembly Point'))
console.log('EN has "Personal Power":', enText.includes('Personal Power'))
console.log('RU has "Точка сборки":', ruText.includes('Точка сборки'))
console.log('RU has "Личная сила":', ruText.includes('Личная сила'))
console.log('RU has "Путь воина":', ruText.includes('Путь воина'))
console.log('RU still has EN "Assembly Point":', ruText.includes('Assembly Point'))
