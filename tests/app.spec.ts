import type { Page } from '@playwright/test'
import { test, expect } from './util/coverage-fixture'
import { stubFirebaseAuth, setupApp, createChannel, createCustomPlaylist, createVideo, mockYoutubeIframeApi } from './util/helpers'

const { describe } = test

// Waits for the (index + 1)th fake YT.Player instance to be constructed.
async function waitForPlayer (page: Page, index = 0) {
  await page.waitForFunction((i) => window.__ytPlayers && window.__ytPlayers.length > i, index)
}

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

describe('Touch support', () => {
  test('adds has-touch class to body on touchstart', async ({ page }) => {
    await page.goto('/login')

    // The class is not applied until the user touches the screen
    await expect(page.locator('body')).not.toHaveClass('has-touch')

    await page.evaluate(() => {
      document.dispatchEvent(new Event('touchstart'))
    })

    await expect(page.locator('body')).toHaveClass('has-touch')
  })
})

describe('Login Page', () => {
  test('displays login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL('/login')
  })
})

describe('Remote All Subs Marked Video', () => {
  test('marks the video in the All Subs view when a remote update includes allSubsMarkedVideoId', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'Channel One', playlistId: 'UU111', order: 0 }),
        'channel-2': createChannel({ id: 'channel-2', title: 'Channel Two', playlistId: 'UU222', order: 1 }),
      },
      videos: [
        createVideo({ id: 'video-1', title: 'Video One' }),
        createVideo({ id: 'video-2', title: 'Video Two' }),
      ],
    })

    await page.goto('/')
    await expect(page.getByText('Video Two').first()).toBeVisible({ timeout: 10000 })

    await page.evaluate(() => {
      window.__triggerSnapshotUpdate!({
        youtubeApiKey: 'fake-api-key',
        watchedVideos: {},
        subs: {
          'channel-1': { id: 'channel-1', title: 'Channel One', playlistId: 'UU111', type: 'channel', order: 0 },
          'channel-2': { id: 'channel-2', title: 'Channel Two', playlistId: 'UU222', type: 'channel', order: 1 },
        },
        allSubsMarkedVideoId: 'video-2',
      })
    })

    await expect(page.locator('.video', { hasText: 'Video Two' }).first()).toHaveClass(/is-marked/)
  })
})

describe('Adding/Removing the Now Playing Video from a Playlist', () => {
  test('can add and remove the now playing video from a custom playlist', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'My Channel', playlistId: 'UU123', order: 0 }),
        'custom-0': createCustomPlaylist({ id: 'custom-0', title: 'Watch Later', order: 1 }),
      },
      videos: [
        createVideo({ id: 'video-1', title: 'Now Playing Video' }),
      ],
    })

    await page.goto('/subs/channel-1?nowPlaying=video-1')

    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })

    await page.locator('.toggle-playlists').click()

    const playlistButton = page.locator('.now-playing .playlist-picker button').filter({ hasText: 'Watch Later' })

    // Add to the custom playlist
    await playlistButton.click()
    await expect(playlistButton.locator('.fa-square-check')).toBeVisible()

    // Remove from the custom playlist
    await playlistButton.click()
    await expect(playlistButton.locator('.fa-square')).toBeVisible()
  })
})

describe('Video Ended Behavior', () => {
  test('does not advance to the next video when auto-play is disabled', async ({ page }) => {
    await mockYoutubeIframeApi(page)
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'My Channel', playlistId: 'UU123', order: 0 }),
      },
      videos: [
        createVideo({ id: 'end-1', title: 'Ending Video' }),
        createVideo({ id: 'end-2', title: 'Next Video' }),
      ],
    })

    await page.goto('/subs/channel-1?nowPlaying=end-1')
    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })

    await page.locator('.toggle-auto-play').click()
    await expect(page.locator('.toggle-auto-play:not(.enabled)')).toBeVisible()

    await waitForPlayer(page)
    await page.evaluate(() => window.__ytPlayers![0].simulateReady())
    await page.evaluate(() => window.__ytPlayers![0].simulateStateChange(window.YT.PlayerState.ENDED))

    // The URL should not change since auto-play is disabled
    await expect(page).toHaveURL(/nowPlaying=end-1/)
  })

  test('does not advance when there is no next video', async ({ page }) => {
    await mockYoutubeIframeApi(page)
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'My Channel', playlistId: 'UU123', order: 0 }),
      },
      videos: [
        createVideo({ id: 'only-1', title: 'Only Video' }),
      ],
    })

    await page.goto('/subs/channel-1?nowPlaying=only-1')
    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })

    await expect(page.locator('.toggle-auto-play.enabled')).toBeVisible()

    await waitForPlayer(page)
    await page.evaluate(() => window.__ytPlayers![0].simulateReady())
    await page.evaluate(() => window.__ytPlayers![0].simulateStateChange(window.YT.PlayerState.ENDED))

    // With no next video, the now playing video should remain unchanged
    await expect(page).toHaveURL(/nowPlaying=only-1/)
  })
})
