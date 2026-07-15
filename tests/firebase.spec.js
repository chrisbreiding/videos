import { test, expect } from './util/coverage-fixture'
import { stubFirebaseAuth } from './util/helpers'

const { describe } = test

// These tests reach the live firebase.js module the running app already
// loaded (see app-state.spec.js for the same pattern), so they exercise the
// real code paths that fall through when no `window.__firebaseStubs` (or
// only a partial one) is configured, alongside the stub branches already
// covered indirectly by every other spec.

describe('firebase lib', () => {
  test('getCurrentUser returns the stubbed user when configured', async ({ page }) => {
    await stubFirebaseAuth(page)
    await page.goto('/')
    await expect(page.locator('.subs')).toBeVisible({ timeout: 10000 })

    const uid = await page.evaluate(async () => {
      const { getCurrentUser } = await import('/src/lib/firebase.js')

      return getCurrentUser().uid
    })

    expect(uid).toBe('test-user-123')
  })

  test('getDoc returns undefined when the user document does not exist', async ({ page }) => {
    await page.addInitScript(() => {
      window.__firebaseStubs = {
        onAuthStateChanged: (callback) => {
          callback(null)

          return () => {}
        },
        userDoc: () => ({
          get: () => Promise.resolve({ exists: false }),
          onSnapshot: () => () => {},
        }),
      }
    })
    await page.goto('/')

    const result = await page.evaluate(async () => {
      const { getDoc } = await import('/src/lib/firebase.js')

      return getDoc()
    })

    expect(result).toBeUndefined()
  })

  test('watchDoc ignores snapshots for a user document that does not exist', async ({ page }) => {
    await page.addInitScript(() => {
      window.__firebaseStubs = {
        onAuthStateChanged: (callback) => {
          callback(null)

          return () => {}
        },
        userDoc: () => ({
          get: () => Promise.resolve({ exists: false }),
          onSnapshot: (callback) => {
            callback({ exists: false })

            return () => {}
          },
        }),
      }
    })
    await page.goto('/')

    const called = await page.evaluate(async () => {
      const { watchDoc } = await import('/src/lib/firebase.js')
      let called = false

      watchDoc(() => { called = true })

      return called
    })

    expect(called).toBe(false)
  })

  test('falls back to the real firebase APIs when no stub is configured', async ({ page }) => {
    await page.goto('/login')

    const results = await page.evaluate(async () => {
      const firebaseLib = await import('/src/lib/firebase.js')
      const out = {}

      try {
        out.currentUser = firebaseLib.getCurrentUser()
      } catch (error) {
        out.currentUserThrew = error.message
      }

      try {
        await firebaseLib.signIn('nobody@example.com', 'wrong-password')
      } catch (error) {
        out.signInThrew = error.message
      }

      try {
        await firebaseLib.signOut()
      } catch (error) {
        out.signOutThrew = error.message
      }

      try {
        await firebaseLib.getDoc()
      } catch (error) {
        out.getDocThrew = error.message
      }

      try {
        firebaseLib.deleteField('someField')
      } catch (error) {
        out.deleteFieldThrew = error.message
      }

      return out
    })

    // No user is signed in, so the real `firebase.auth()` calls above should
    // run without a stub short-circuiting them.
    expect(results.currentUser).toBeFalsy()
    expect(results.currentUserThrew).toBeUndefined()
  })
})
