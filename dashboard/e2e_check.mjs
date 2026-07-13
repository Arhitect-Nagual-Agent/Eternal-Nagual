// Isolated E2E smoke check for the Nagual dashboard tabs.
// Reloads the page per tab so one tab's crash can't block the next.
// Real crash signal = uncaught pageerror or the Next.js error dialog ([data-nextjs-dialog]).
import { chromium } from 'playwright-core'
import { mkdirSync } from 'fs'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = 'http://localhost:3000'
const OUT = 'C:\\Users\\Farmer-9\\AppData\\Local\\Temp\\nagual_e2e'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ executablePath: CHROME, headless: true })

// nav order in Sidebar.tsx (status is the initial tab, no button)
const TABS = ['mind','toltec','meta','memory','llm','evolution','research',
  'safety','heartbeat','tools','swarm','logs','settings','chat','goals','thoughts']

const report = []

for (let i = 0; i < TABS.length; i++) {
  const id = TABS[i]
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const pageErrors = []
  const consoleErrors = []
  page.on('pageerror', (e) => pageErrors.push(String(e.message || e)))
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })

  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(1200)
    await page.locator('nav button').nth(i).click({ timeout: 6000 })
    await page.waitForTimeout(1800)
    const dialog = await page.locator('[data-nextjs-dialog], [data-nextjs-dialog-overlay]').count()
    report.push({ tab: id, overlay: dialog > 0, pageErrors, consoleErrors })
    await page.screenshot({ path: `${OUT}\\${String(i + 1).padStart(2, '0')}-${id}.png` })
  } catch (e) {
    report.push({ tab: id, clickError: String(e.message || e), pageErrors, consoleErrors })
  }
  await page.close()
}

await browser.close()

let bad = 0
console.log('\n===== NAGUAL DASHBOARD E2E REPORT (isolated) =====')
for (const r of report) {
  const fail = r.overlay || r.clickError || r.pageErrors.length > 0
  if (fail) bad++
  console.log(`\n[${fail ? 'FAIL' : 'ok  '}] ${r.tab}`)
  if (r.clickError) console.log('   clickError:', r.clickError.split('\n')[0])
  if (r.overlay) console.log('   >>> Next.js ERROR DIALOG visible')
  r.pageErrors.forEach((e) => console.log('   pageerror:', e))
  r.consoleErrors.filter((e) => !/404|Failed to load resource/.test(e)).slice(0, 3)
    .forEach((e) => console.log('   console:', e.slice(0, 160)))
}
console.log(`\n===== ${bad} tab(s) with errors / ${report.length} checked =====`)
console.log(`screenshots: ${OUT}`)
