import type { Page } from '@playwright/test'
import { test, expect } from './util/coverage-fixture'
import {
  setupApp,
  createChannel,
  createVideo,
  mockYoutubeIframeApi,
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

describe('YoutubePlayer', () => {
  test('marks the player ready and tracks progress while playing', async ({
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
          id: 'track-1',
          title: 'Tracked Video',
          duration: 'PT10M0S',
        }),
      ],
    })

    await page.goto('/subs/channel-1?nowPlaying=track-1')

    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })

    await waitForPlayer(page)

    // the tracking interval ticks before the player reports ready, which
    // should be a no-op
    await page.waitForTimeout(1300)

    await page.evaluate(() => window.__ytPlayers![0].simulateReady())

    // the tracking interval also ticks once more while ready but not yet
    // playing, which should also be a no-op
    await page.waitForTimeout(1300)

    // playing at 60s of a 600s video => 10% watched, tracked every second
    await page.evaluate(() => {
      window.__ytPlayers![0].currentTime = 60
      window.__ytPlayers![0].simulateStateChange(window.YT.PlayerState.PLAYING)
    })

    // wait past the tracking interval so the periodic saveTime call fires
    await page.waitForTimeout(1300)

    await page.locator('.now-playing .close').click()

    const progressBar = page.locator('.watch-progress .watch-progress-bar')
    await expect(progressBar).toBeVisible()
    await expect(progressBar).toHaveAttribute('style', /width:\s*10%/)
  })

  test('reuses the already-loaded API script when opening a second video', async ({
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
        createVideo({ id: 'reuse-1', title: 'First Video' }),
        createVideo({ id: 'reuse-2', title: 'Second Video' }),
      ],
    })

    await page.goto('/subs/channel-1?nowPlaying=reuse-1')
    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })
    await waitForPlayer(page, 0)

    // close and reopen with a different video via client-side navigation
    // (no full page reload) so the API script tag remains in the document
    // and the player is initialized directly this time, instead of
    // re-fetching the script
    await page.locator('.now-playing .close').click()
    await expect(page.locator('.now-playing')).toHaveCount(0)

    await page.locator('.play-video').nth(1).click()
    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })
    await waitForPlayer(page, 1)

    expect(await page.evaluate(() => window.__ytPlayers!.length)).toBe(2)
  })

  test('saves progress immediately when the video is paused', async ({
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
          id: 'pause-1',
          title: 'Paused Video',
          duration: 'PT10M0S',
        }),
      ],
    })

    await page.goto('/subs/channel-1?nowPlaying=pause-1')
    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })

    await waitForPlayer(page)
    await page.evaluate(() => window.__ytPlayers![0].simulateReady())

    await page.evaluate(() => {
      window.__ytPlayers![0].currentTime = 300
      window.__ytPlayers![0].simulateStateChange(window.YT.PlayerState.PAUSED)
    })

    await page.locator('.now-playing .close').click()

    const progressBar = page.locator('.watch-progress .watch-progress-bar')
    await expect(progressBar).toBeVisible()
    await expect(progressBar).toHaveAttribute('style', /width:\s*50%/)
  })

  test('ignores non-numeric current time values when saving progress', async ({
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
          id: 'invalid-time',
          title: 'Invalid Time Video',
          duration: 'PT10M0S',
        }),
      ],
    })

    await page.goto('/subs/channel-1?nowPlaying=invalid-time')
    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })

    await waitForPlayer(page)
    await page.evaluate(() => window.__ytPlayers![0].simulateReady())

    await page.evaluate(() => {
      window.__ytPlayers![0].currentTime = NaN
      window.__ytPlayers![0].simulateStateChange(window.YT.PlayerState.PAUSED)
    })

    await page.locator('.now-playing .close').click()

    await expect(page.locator('.watch-progress')).toHaveCount(0)
  })

  test('advances to the next video and reloads the player when playback ends', async ({
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
        createVideo({ id: 'end-1', title: 'Ending Video' }),
        createVideo({ id: 'end-2', title: 'Next Video' }),
      ],
    })

    await page.goto('/subs/channel-1?nowPlaying=end-1')
    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })

    // auto-play is enabled by default
    await expect(page.locator('.toggle-auto-play.enabled')).toBeVisible()

    await waitForPlayer(page)
    await page.evaluate(() => window.__ytPlayers![0].simulateReady())
    await page.evaluate(() =>
      window.__ytPlayers![0].simulateStateChange(window.YT.PlayerState.ENDED),
    )

    // the app advances to the next video, which changes the player's `id`
    // prop and reloads the existing player instance rather than remounting it
    await expect(page).toHaveURL(/nowPlaying=end-2/)

    // the URL updates in the same tick as the state change that reloads the
    // player, but the two commits aren't guaranteed to land together, so poll
    // rather than reading the calls immediately after the URL settles
    await expect
      .poll(() => page.evaluate(() => window.__ytPlayers![0].calls.stopVideo))
      .toBe(1)
    const calls = await page.evaluate(() => window.__ytPlayers![0].calls)
    expect(calls.loadVideoById).toEqual([{ videoId: 'end-2', startSeconds: 0 }])
    expect(await page.evaluate(() => window.__ytPlayers!.length)).toBe(1)
  })

  test('resizes the player when the now-playing dimensions change', async ({
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
      videos: [createVideo({ id: 'resize-1', title: 'Resizable Video' })],
    })

    await page.goto('/subs/channel-1?nowPlaying=resize-1')
    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })

    await waitForPlayer(page)
    await page.evaluate(() => window.__ytPlayers![0].simulateReady())

    const resizer = page.locator('.resizer')
    const box = (await resizer.boundingBox())!

    await page.mouse.move(box.x + box.width / 2, box.y)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2, box.y + 150)
    await page.mouse.up()

    await expect
      .poll(() =>
        page.evaluate(() => window.__ytPlayers![0].calls.setSize.length),
      )
      .toBeGreaterThan(0)
  })

  test('destroys the player when it is closed', async ({ page }) => {
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
      videos: [createVideo({ id: 'destroy-1', title: 'Destroyable Video' })],
    })

    await page.goto('/subs/channel-1?nowPlaying=destroy-1')
    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })

    await waitForPlayer(page)
    await page.evaluate(() => window.__ytPlayers![0].simulateReady())

    await page.locator('.now-playing .close').click()
    await expect(page.locator('.now-playing')).toHaveCount(0)

    expect(
      await page.evaluate(() => window.__ytPlayers![0].calls.destroy),
    ).toBe(1)
  })
})
