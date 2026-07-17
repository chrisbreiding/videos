import type { DocumentData } from 'firebase/firestore'
import { test, expect } from './util/coverage-fixture'
import { stubFirebaseAuth } from './util/helpers'

const { describe } = test

// `update`, `removeSub`, and `removeVideoFromSub` are already exercised
// indirectly through app-state/subs specs. `fetch` and `listen` aren't
// called anywhere in the app, so they're covered directly here.

describe('remote-data lib', () => {
  test('fetch returns the current user document data', async ({ page }) => {
    await stubFirebaseAuth(page, {
      subs: {
        'channel-1': {
          id: 'channel-1',
          title: 'Test Channel',
          type: 'channel',
          order: 0,
        },
      },
    })
    await page.goto('/')
    await expect(page.locator('.subs')).toBeVisible({ timeout: 10000 })

    const data = await page.evaluate(async () => {
      const { fetch } = await import('/src/lib/remote-data.ts')

      return fetch()
    })

    expect(data.subs['channel-1'].title).toBe('Test Channel')
  })

  test('listen invokes the callback with document changes', async ({ page }) => {
    await stubFirebaseAuth(page)
    await page.goto('/')
    await expect(page.locator('.subs')).toBeVisible({ timeout: 10000 })

    const result = await page.evaluate(async () => {
      const { listen } = await import('/src/lib/remote-data.ts')

      return new Promise<DocumentData>((resolve) => {
        listen((data: DocumentData) => resolve(data))
      })
    })

    expect(result.subs['channel-1'].title).toBe('Test Channel')
  })
})
