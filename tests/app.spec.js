import { test, expect } from './util/coverage-fixture'
import { stubFirebaseAuth } from './util/helpers'

const { describe } = test

describe('Videos App', () => {
  test('has correct title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle('Videos')
  })

  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/')
    // The app should redirect to login when user is not authenticated
    await expect(page).toHaveURL(/\/login/)
  })
})

describe('Authenticated App', () => {
  test('loads app when user is authenticated', async ({ page }) => {
    await stubFirebaseAuth(page)

    await page.goto('/')

    // Should not redirect to login
    await expect(page).not.toHaveURL(/\/login/)

    // Should show the authenticated app (subs list visible)
    await expect(page.locator('.subs')).toBeVisible({ timeout: 10000 })
  })

  test('displays subscribed channel in sidebar', async ({ page }) => {
    await stubFirebaseAuth(page, {
      subs: {
        'channel-1': {
          id: 'channel-1',
          title: 'My Favorite Channel',
          thumb: 'https://example.com/thumb.jpg',
          playlistId: 'UU123',
          type: 'channel',
          order: 0,
        },
      },
    })

    await page.goto('/')

    // Wait for the app to load and show the channel
    await expect(page.getByText('My Favorite Channel')).toBeVisible({ timeout: 10000 })
  })
})

describe('Login Page', () => {
  test('displays login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL('/login')
  })
})

describe('404 Page', () => {
  test('displays 404 for unknown routes', async ({ page }) => {
    await page.goto('/unknown-route')
    await expect(page.getByText('404 - Not Found')).toBeVisible()
  })

  test('has link back to subs', async ({ page }) => {
    await page.goto('/unknown-route')
    const subsLink = page.getByRole('link', { name: 'Subs' })
    await expect(subsLink).toBeVisible()
  })
})
