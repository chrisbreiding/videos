import { test, expect } from './util/coverage-fixture'

const { describe } = test

/**
 * Stubs an authenticated user whose sign-out resolves after a short delay, so
 * the "Logging out..." message has time to render before the redirect to
 * /login, and reports the user as signed out afterward so /login doesn't
 * immediately bounce back to /.
 */
async function stubAuthenticatedThenSignOut(page) {
  await page.addInitScript(() => {
    let signedOut = false

    window.__firebaseStubs = {
      currentUser: { uid: 'test-user-123' },

      onAuthStateChanged: (callback) => {
        setTimeout(() => callback(signedOut ? null : { uid: 'test-user-123' }), 0)
        return () => {}
      },

      signIn: () => Promise.resolve({ user: { uid: 'test-user-123' } }),

      signOut: () => new Promise((resolve) => {
        setTimeout(() => {
          signedOut = true
          resolve()
        }, 300)
      }),

      userDoc: () => ({
        get: () => Promise.resolve({
          exists: true,
          data: () => ({ youtubeApiKey: 'fake-api-key', subs: {}, watchedVideos: {} }),
        }),
        onSnapshot: (callback) => {
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
  })
}

describe('Logout', () => {
  test('shows a logging out message while signing out', async ({ page }) => {
    await stubAuthenticatedThenSignOut(page)

    await page.goto('/logout')

    await expect(page.locator('.logout')).toContainText('Logging out...')
  })

  test('signs out and navigates to the login page', async ({ page }) => {
    await stubAuthenticatedThenSignOut(page)

    await page.goto('/logout')

    await expect(page).toHaveURL('/login')
  })
})
