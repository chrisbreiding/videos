import type { Page } from '@playwright/test'
import { test, expect } from './util/coverage-fixture'
import { setupApp, createChannel, createVideo } from './util/helpers'

const { describe } = test

describe('Playing a Video', () => {
  test('can open video player', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'My Channel',
          playlistId: 'UU123',
          order: 0,
        }),
      },
      videos: [createVideo({ id: 'abc123', title: 'Watch This Video' })],
    })

    await page.goto('/subs/channel-1')

    await expect(page.getByText('Watch This Video')).toBeVisible({
      timeout: 10000,
    })

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
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'My Channel',
          playlistId: 'UU123',
          order: 0,
        }),
      },
      videos: [createVideo({ id: 'xyz789', title: 'Closeable Video' })],
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
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'My Channel',
          playlistId: 'UU123',
          order: 0,
        }),
      },
      videos: [
        createVideo({
          id: 'desc123',
          title: 'Video With Description',
          description: 'This is the video description',
        }),
      ],
    })

    await page.goto('/subs/channel-1?nowPlaying=desc123')

    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })

    // Toggle description
    await page.locator('.toggle-description').click()

    // Description should be visible
    await expect(
      page.locator('.now-playing.is-showing-description'),
    ).toBeVisible()
  })

  test('can toggle auto-play', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'My Channel',
          playlistId: 'UU123',
          order: 0,
        }),
      },
      videos: [createVideo({ id: 'auto123', title: 'Auto Play Video' })],
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

  test('can toggle playlist picker', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'My Channel',
          playlistId: 'UU123',
          order: 0,
        }),
      },
      videos: [
        createVideo({ id: 'playlists123', title: 'Video With Playlists' }),
      ],
    })

    await page.goto('/subs/channel-1?nowPlaying=playlists123')

    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })

    // Showing the description first should close it again when playlists open
    await page.locator('.toggle-description').click()
    await expect(
      page.locator('.now-playing.is-showing-description'),
    ).toBeVisible()

    // Toggle playlists
    await page.locator('.toggle-playlists').click()

    // Playlists should be visible and description should be hidden
    await expect(
      page.locator('.now-playing.is-showing-playlists'),
    ).toBeVisible()
    await expect(
      page.locator('.now-playing.is-showing-description'),
    ).not.toBeVisible()

    // Toggle playlists off
    await page.locator('.toggle-playlists').click()

    await expect(
      page.locator('.now-playing.is-showing-playlists'),
    ).not.toBeVisible()
  })

  test('renders description links so they open in a new tab', async ({
    page,
  }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'My Channel',
          playlistId: 'UU123',
          order: 0,
        }),
      },
      videos: [
        createVideo({
          id: 'link123',
          title: 'Video With Link',
          description: 'Check out [this link](https://example.com)',
        }),
      ],
    })

    await page.goto('/subs/channel-1?nowPlaying=link123')

    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })

    await page.locator('.toggle-description').click()

    const link = page.locator('.now-playing .description a', {
      hasText: 'this link',
    })

    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('target', '_blank')
  })

  test('updates page title when playing video', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'My Channel',
          playlistId: 'UU123',
          order: 0,
        }),
      },
      videos: [createVideo({ id: 'title123', title: 'Amazing Video Title' })],
    })

    await page.goto('/subs/channel-1?nowPlaying=title123')

    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })

    // Page title should include the video title
    await expect(page).toHaveTitle(/Amazing Video Title/)
  })
})

describe('Now Playing Height', () => {
  interface SetupOptions {
    storedHeight: number
    viewportHeight: number
  }

  // Seeds the stored now-playing height (read from localStorage on startup)
  // and sizes the viewport so window.innerHeight (the max-height basis) is known
  async function setup(
    page: Page,
    { storedHeight, viewportHeight }: SetupOptions,
  ) {
    await page.addInitScript((height) => {
      localStorage.nowPlayingHeight = JSON.stringify(height)
    }, storedHeight)

    await page.setViewportSize({ width: 1280, height: viewportHeight })

    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'My Channel',
          playlistId: 'UU123',
          order: 0,
        }),
      },
      videos: [createVideo({ id: 'height123', title: 'Height Video' })],
    })

    await page.goto('/subs/channel-1?nowPlaying=height123')

    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })
  }

  // The rendered inline `height` style reflects the clamped nowPlayingHeight
  async function renderedHeight(page: Page): Promise<number> {
    return page
    .locator('.now-playing')
    .evaluate((el) => parseInt((el as HTMLElement).style.height, 10))
  }

  test('clamps to the max height when the stored height exceeds it', async ({
    page,
  }) => {
    await setup(page, { storedHeight: 100000, viewportHeight: 800 })

    // _maxNowPlayingHeight is window.innerHeight - 10
    const innerHeight = await page.evaluate(() => window.innerHeight)

    expect(await renderedHeight(page)).toBe(innerHeight - 10)
  })

  test('clamps to the min height when the stored height is below it', async ({
    page,
  }) => {
    await setup(page, { storedHeight: 10, viewportHeight: 800 })

    // minNowPlayingHeight is 100
    expect(await renderedHeight(page)).toBe(100)
  })

  test('leaves the height unchanged when within the allowed range', async ({
    page,
  }) => {
    await setup(page, { storedHeight: 400, viewportHeight: 800 })

    expect(await renderedHeight(page)).toBe(400)
  })
})
