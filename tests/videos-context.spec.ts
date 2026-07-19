import type { Page } from '@playwright/test'
import { test, expect } from './util/coverage-fixture'
import {
  createChannel,
  createVideo,
  mockYoutubeIframeApi,
  setupApp,
} from './util/helpers'

const { describe } = test

// Waits for the (index + 1)th fake YT.Player instance to be constructed and
// returns a locator-free handle for driving it via page.evaluate.
async function waitForPlayer(page: Page, index = 0) {
  await page.waitForFunction(
    (i) => window.__ytPlayers && window.__ytPlayers!.length > i,
    index,
  )
}

async function endPlayback(page: Page) {
  await waitForPlayer(page)
  await page.evaluate(() => window.__ytPlayers![0].simulateReady())
  await page.evaluate(() =>
    window.__ytPlayers![0].simulateStateChange(window.YT.PlayerState.ENDED),
  )
}

describe('videos/videos-context', () => {
  test('videos are sorted newest published first', async ({ page }) => {
    await mockYoutubeIframeApi(page)
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'My Channel',
          playlistId: 'UU123',
          order: 0,
        }),
      },
      // Older video listed first so the sort comparator is exercised with a
      // video1/video2 pair where video1 was published before video2.
      videos: [
        createVideo({
          id: 'video-1',
          title: 'Older Video',
          published: '2024-01-01T00:00:00Z',
        }),
        createVideo({
          id: 'video-2',
          title: 'Newer Video',
          published: '2024-02-01T00:00:00Z',
        }),
      ],
    })

    await page.goto('/subs/channel-1')

    const titles = page.locator('.video h4')
    await expect(titles).toHaveCount(2, { timeout: 10000 })
    await expect(titles.nth(0)).toHaveText('Newer Video')
    await expect(titles.nth(1)).toHaveText('Older Video')
  })

  test('does not advance when the now playing video is not in the list', async ({
    page,
  }) => {
    await mockYoutubeIframeApi(page)
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
          id: 'video-1',
          title: 'Video 1',
          published: '2024-01-01T00:00:00Z',
        }),
        createVideo({
          id: 'video-2',
          title: 'Video 2',
          published: '2024-01-02T00:00:00Z',
        }),
      ],
    })

    await page.goto('/subs/channel-1?nowPlaying=missing-video')
    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })

    await endPlayback(page)

    await expect(page).toHaveURL(/nowPlaying=missing-video/)
  })

  test('does not advance when the now playing video is the last one', async ({
    page,
  }) => {
    await mockYoutubeIframeApi(page)
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
          id: 'video-1',
          title: 'Video 1',
          published: '2024-01-02T00:00:00Z',
        }),
        createVideo({
          id: 'video-2',
          title: 'Video 2',
          published: '2024-01-01T00:00:00Z',
        }),
      ],
    })

    // video-2 has the oldest published date, so it displays last.
    await page.goto('/subs/channel-1?nowPlaying=video-2')
    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })

    await endPlayback(page)

    await expect(page).toHaveURL(/nowPlaying=video-2/)
  })
})
