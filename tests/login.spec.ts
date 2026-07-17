import type { Page } from '@playwright/test'
import { test, expect } from './util/coverage-fixture'
import { stubFirebaseAuth } from './util/helpers'

const { describe } = test

/**
 * Sets up Firebase stubs where no user is authenticated yet, so the login page
 * stays put instead of redirecting. `signIn` flips an internal flag so that any
 * subsequent `onAuthStateChanged` call (e.g. from the app after a successful
 * login) reports the now-authenticated user.
 */
async function stubUnauthenticated (page: Page, { signInSucceeds = true } = {}) {
  await page.addInitScript(({ signInSucceeds }) => {
    let signedIn = false

    window.__firebaseStubs = {
      onAuthStateChanged: (callback) => {
        setTimeout(() => callback(signedIn ? { uid: 'test-user-123' } as never : null), 0)
        return () => {}
      },

      signIn: () => {
        if (!signInSucceeds) return Promise.reject(new Error('invalid credentials'))

        signedIn = true
        return Promise.resolve({ user: { uid: 'test-user-123' } })
      },

      signOut: () => Promise.resolve(),

      userDoc: () => ({
        get: () => Promise.resolve({
          exists: true,
          data: () => ({ youtubeApiKey: 'fake-api-key', subs: {}, watchedVideos: {} }),
        }),
        onSnapshot: (callback: (snapshot: { exists: boolean, data: () => unknown }) => void) => {
          setTimeout(() => {
            callback({
              exists: true,
              data: () => ({ youtubeApiKey: 'fake-api-key', subs: {}, watchedVideos: {} }),
            })
          }, 0)
          return () => {}
        },
        set: () => Promise.resolve(),
        update: () => Promise.resolve(),
      }),

      deleteField: () => Promise.resolve(),
    }
  }, { signInSucceeds })
}

describe('Login', () => {
  test('redirects to / when already authenticated', async ({ page }) => {
    // An authenticated user landing on the login page is sent straight home.
    await stubFirebaseAuth(page)

    await page.goto('/login')

    await expect(page).not.toHaveURL(/\/login/)
  })

  test('focuses the email field on load', async ({ page }) => {
    await stubUnauthenticated(page)

    await page.goto('/login')

    await expect(page.locator('input[name="email"]')).toBeFocused()
  })

  test('logs in and navigates to the app on success', async ({ page }) => {
    await stubUnauthenticated(page, { signInSucceeds: true })

    await page.goto('/login')

    await page.locator('input[name="email"]').fill('user@example.com')
    await page.locator('input[name="password"]').fill('password')
    await page.getByRole('button', { name: 'Log In' }).click()

    // After a successful login we navigate away from /login and the app loads.
    await expect(page).toHaveURL('/')
    await expect(page.locator('.subs')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Login failed. Try again.')).not.toBeVisible()
  })

  test('shows an error message and stays on the login page on failure', async ({ page }) => {
    await stubUnauthenticated(page, { signInSucceeds: false })

    await page.goto('/login')

    await page.locator('input[name="email"]').fill('user@example.com')
    await page.locator('input[name="password"]').fill('wrong-password')
    await page.getByRole('button', { name: 'Log In' }).click()

    await expect(page.getByText('Login failed. Try again.')).toBeVisible()
    await expect(page).toHaveURL('/login')
  })
})
