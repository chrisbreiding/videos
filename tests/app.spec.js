import { test, expect } from '@playwright/test'

test.describe('Videos App', () => {
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

test.describe('Login Page', () => {
  test('displays login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL('/login')
  })
})

test.describe('404 Page', () => {
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
