import { test, expect } from './util/coverage-fixture'
import { stubFirebaseAuth } from './util/helpers'

const { describe } = test

// This file directly exercises the one branch in src/login/auth-context.tsx
// that isn't already reached indirectly through the app-level specs (e.g.
// login.spec.ts, logout.spec.ts, videos-context.spec.ts): checkApiKey
// short-circuiting without calling out to the youtube api when the user doc
// has no api key yet.
describe('login/auth-context', () => {
  test('does not check the youtube api when no api key is present on the user doc', async ({
    page,
  }) => {
    let youtubeApiRequested = false

    await page.route(
      'https://www.googleapis.com/youtube/v3/**',
      async (route) => {
        youtubeApiRequested = true
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: [] }),
        })
      },
    )

    await stubFirebaseAuth(page, { youtubeApiKey: '' })
    await page.goto('/')

    await expect(page.locator('.loader')).toContainText('Loading...')

    // Give any pending async work a chance to run before asserting nothing
    // happened, since there's no visible state change to wait on here.
    await page.waitForTimeout(300)

    expect(youtubeApiRequested).toBe(false)
    await expect(page.locator('.subs')).not.toBeVisible()
  })
})
