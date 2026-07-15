import { test, expect } from './util/coverage-fixture'
import { stubFirebaseAuth } from './util/helpers'

const { describe } = test

// This file directly exercises the couple of branches in src/login/auth-store.js
// that aren't already reached indirectly through the app-level specs (e.g.
// login.spec.js, logout.spec.js, app-state.spec.js): setApiKey and
// checkApiKey short-circuiting on a falsy value.

describe('login/auth-store', () => {
  test('setApiKey does nothing when given a falsy value', async ({ page }) => {
    await stubFirebaseAuth(page)
    await page.goto('/')
    await expect(page.locator('.subs')).toBeVisible({ timeout: 10000 })

    const youtubeApiKey = await page.evaluate(async () => {
      const { authStore } = await import('/src/login/auth-store.js')

      authStore.setApiKey(undefined)

      return authStore.youtubeApiKey
    })

    expect(youtubeApiKey).toBe('fake-api-key')
  })

  test('checkApiKey resolves false without calling out when given a falsy value', async ({ page }) => {
    await stubFirebaseAuth(page)
    await page.goto('/')
    await expect(page.locator('.subs')).toBeVisible({ timeout: 10000 })

    const result = await page.evaluate(async () => {
      const { authStore } = await import('/src/login/auth-store.js')

      return authStore.checkApiKey('')
    })

    expect(result).toBe(false)
  })
})
