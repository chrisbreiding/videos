const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { test: base, expect } = require('@playwright/test')

const NYC_OUTPUT_DIR = path.join(__dirname, '..', '..', '.nyc_output')

// Only collect coverage when instrumentation is enabled (COVERAGE=1). This
// keeps normal `npm test` runs fast and free of any coverage overhead.
const collectCoverage = !!process.env.COVERAGE

// An auto fixture wraps every test: after the test body runs we read the
// Istanbul coverage object that vite-plugin-istanbul exposes on the page and
// append it to .nyc_output for `nyc report` to consume.
const test = base.extend({
  autoCoverage: [async ({ page }, use) => {
    await use()

    if (!collectCoverage) return

    let coverage
    try {
      coverage = await page.evaluate(() => window.__coverage__)
    } catch {
      // Page may already be closed (e.g. navigation/crash); nothing to collect.
      return
    }

    if (!coverage) return

    fs.mkdirSync(NYC_OUTPUT_DIR, { recursive: true })
    const file = path.join(NYC_OUTPUT_DIR, `${crypto.randomUUID()}.json`)
    fs.writeFileSync(file, JSON.stringify(coverage))
  }, { auto: true }],
})

module.exports = { test, expect }
