import { test, expect } from './util/coverage-fixture'
import { setupApp, createChannel, createVideo } from './util/helpers'

const { describe } = test

describe('Playing a Video', () => {
  test('can open video player', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'My Channel', playlistId: 'UU123', order: 0 }),
      },
      videos: [
        createVideo({ id: 'abc123', title: 'Watch This Video' }),
      ],
    })

    await page.goto('/subs/channel-1')

    await expect(page.getByText('Watch This Video')).toBeVisible({ timeout: 10000 })

    // Click the play button on the video
    await page.locator('.play-video').first().click()

    // URL should have nowPlaying query param
    await expect(page).toHaveURL(/nowPlaying=abc123/)

    // Now playing section should be visible
    await expect(page.locator('.now-playing')).toBeVisible()
  })

  test('can close video player', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'My Channel', playlistId: 'UU123', order: 0 }),
      },
      videos: [
        createVideo({ id: 'xyz789', title: 'Closeable Video' }),
      ],
    })

    await page.goto('/subs/channel-1?nowPlaying=xyz789')

    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })

    // Close the video
    await page.locator('.now-playing .close').click()

    // Now playing should be gone
    await expect(page).not.toHaveURL(/nowPlaying/)
  })

  test('can toggle video description', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'My Channel', playlistId: 'UU123', order: 0 }),
      },
      videos: [
        createVideo({ id: 'desc123', title: 'Video With Description', description: 'This is the video description' }),
      ],
    })

    await page.goto('/subs/channel-1?nowPlaying=desc123')

    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })

    // Toggle description
    await page.locator('.toggle-description').click()

    // Description should be visible
    await expect(page.locator('.now-playing.is-showing-description')).toBeVisible()
  })

  test('can toggle auto-play', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'My Channel', playlistId: 'UU123', order: 0 }),
      },
      videos: [
        createVideo({ id: 'auto123', title: 'Auto Play Video' }),
      ],
    })

    await page.goto('/subs/channel-1?nowPlaying=auto123')

    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })

    // Auto-play is enabled by default
    await expect(page.locator('.toggle-auto-play.enabled')).toBeVisible()

    // Toggle auto-play off
    await page.locator('.toggle-auto-play').click()

    // Auto-play button should now be disabled (no enabled class)
    await expect(page.locator('.toggle-auto-play:not(.enabled)')).toBeVisible()

    // Toggle auto-play back on
    await page.locator('.toggle-auto-play').click()

    // Auto-play button should be enabled again
    await expect(page.locator('.toggle-auto-play.enabled')).toBeVisible()
  })

  test('updates page title when playing video', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'My Channel', playlistId: 'UU123', order: 0 }),
      },
      videos: [
        createVideo({ id: 'title123', title: 'Amazing Video Title' }),
      ],
    })

    await page.goto('/subs/channel-1?nowPlaying=title123')

    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })

    // Page title should include the video title
    await expect(page).toHaveTitle(/Amazing Video Title/)
  })
})
