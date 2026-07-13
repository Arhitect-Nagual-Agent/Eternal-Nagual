import { chromium } from 'playwright-core'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const OUT = 'C:\\Users\\Farmer-9\\AppData\\Local\\Temp\\nagual_e2e'
const b = await chromium.launch({ executablePath: CHROME, headless: true })
const p = await b.newPage({ viewport: { width: 1280, height: 300 } })
const errs = []
p.on('pageerror', e => errs.push(e.message))
await p.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(2000)
// check the header img src + natural load
const info = await p.evaluate(() => {
  const img = document.querySelector('header img')
  return img ? { src: img.getAttribute('src'), complete: img.complete, w: img.naturalWidth } : null
})
console.log('header img:', JSON.stringify(info))
console.log('pageerrors:', errs.length ? errs : 'NONE')
await p.screenshot({ path: `${OUT}\\nagual_header.png` })
await b.close()
