import type { Page } from '@playwright/test'
import { test, expect } from './util/coverage-fixture'
import {
  setupApp,
  createChannel,
  createVideo,
  mockYoutubeIframeApi,
} from './util/helpers'

const { describe } = test

// Records every firestore `set` payload so tests can assert whether a save
// was flushed immediately or deferred to the debounced writer.
async function recordSetCalls(page: Page) {
  await page.addInitScript(() => {
    window.__setCalls = []
    window.__deleteFieldCalls = []
    const originalUserDoc = window.__firebaseStubs!.userDoc!
    window.__firebaseStubs!.userDoc = () => {
      const doc = originalUserDoc()
      const originalSet = doc.set
      doc.set = (data: unknown, options: unknown) => {
        window.__setCalls!.push(data)
        return originalSet(data, options)
      }
      return doc
    }
    const originalDeleteField = window.__firebaseStubs!.deleteField!
    window.__firebaseStubs!.deleteField = (fieldPath: string) => {
      window.__deleteFieldCalls!.push(fieldPath)
      return originalDeleteField(fieldPath)
    }
  })
}

async function waitForPlayer(page: Page) {
  await page.waitForFunction(() => window.__ytPlayers && window.__ytPlayers.length > 0)
}

describe('AppContext#saveVideoProgress', () => {
  async function setup(page: Page) {
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
      videos: [createVideo({ id: 'video-abc', title: 'Progress Video' })],
    })
    await recordSetCalls(page)

    await page.goto('/subs/channel-1?nowPlaying=video-abc')
    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })
    await waitForPlayer(page)

    await page.evaluate(() => {
      window.__ytPlayers![0].simulateReady()
      window.__ytPlayers![0].currentTime = 42
    })
  }

  test('flushes the save immediately when the video is paused', async ({
    page,
  }) => {
    await setup(page)

    await page.evaluate(() => {
      window.__ytPlayers![0].simulateStateChange(window.YT.PlayerState.PLAYING)
      window.__ytPlayers![0].simulateStateChange(window.YT.PlayerState.PAUSED)
    })

    await expect
      .poll(() => page.evaluate(() => window.__setCalls))
      .toEqual([
        {
          watchedVideos: {
            'video-abc': { watchTimestamp: 42, updatedAt: expect.any(String) },
          },
        },
      ])
  })

  test('debounces the save while the video keeps playing', async ({
    page,
  }) => {
    await setup(page)

    await page.evaluate(() => {
      window.__ytPlayers![0].simulateStateChange(window.YT.PlayerState.PLAYING)
    })

    // the periodic tracking tick records progress in memory right away...
    await expect(page.locator('.watch-progress')).toHaveCount(0)

    // ...but the remote write is debounced, so nothing is flushed yet
    await page.waitForTimeout(1100)
    expect(await page.evaluate(() => window.__setCalls)).toEqual([])

    // once the debounce elapses, the tracked progress is flushed on its own
    await expect
      .poll(() => page.evaluate(() => window.__setCalls), { timeout: 6000 })
      .toEqual([
        {
          watchedVideos: {
            'video-abc': { watchTimestamp: 42, updatedAt: expect.any(String) },
          },
        },
      ])
  })
})

describe('AppContext#setAllSubsMarkedVideoId', () => {
  async function setup(page: Page) {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'Channel One',
          playlistId: 'UU111',
          order: 0,
        }),
      },
      videos: [createVideo({ id: 'video-1', title: 'All Subs Video' })],
    })
    await recordSetCalls(page)

    await page.goto('/')
    await expect(page.getByText('All Subs Video')).toBeVisible({
      timeout: 10000,
    })
  }

  test('saves remotely when marking a video from the All Subs view', async ({
    page,
  }) => {
    await setup(page)

    await page.locator('.play-video').first().click()
    await expect(page.locator('.video.is-marked')).toBeVisible({
      timeout: 10000,
    })

    expect(await page.evaluate(() => window.__setCalls)).toEqual([
      { allSubsMarkedVideoId: 'video-1' },
    ])
  })

  test('deletes the remote field instead of saving undefined when unmarked', async ({
    page,
  }) => {
    await setup(page)

    await page.locator('.play-video').first().click()
    await expect(page.locator('.video.is-marked')).toBeVisible({
      timeout: 10000,
    })

    await page.evaluate(() => {
      window.__setCalls!.length = 0
      window.__deleteFieldCalls!.length = 0
    })

    await page.locator('.remove-video-marker').click()
    await expect(page.locator('.video.is-marked')).not.toBeVisible()

    expect(await page.evaluate(() => window.__setCalls)).toEqual([])
    expect(await page.evaluate(() => window.__deleteFieldCalls)).toEqual([
      'allSubsMarkedVideoId',
    ])
  })

  test('does not save remotely when a remote update sets the marked video', async ({
    page,
  }) => {
    await setup(page)

    await page.evaluate(() => {
      window.__setCalls!.length = 0

      window.__triggerSnapshotUpdate!({
        youtubeApiKey: 'fake-api-key',
        watchedVideos: {},
        subs: {
          'channel-1': {
            id: 'channel-1',
            title: 'Channel One',
            playlistId: 'UU111',
            type: 'channel',
            order: 0,
          },
        },
        allSubsMarkedVideoId: 'video-1',
      })
    })

    await expect(page.locator('.video.is-marked')).toBeVisible({
      timeout: 10000,
    })

    expect(await page.evaluate(() => window.__setCalls)).toEqual([])
  })
})

describe('AppContext#_onWindowResize', () => {
  test('updates windowHeight when the window is resized', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'My Channel',
          playlistId: 'UU123',
          order: 0,
        }),
      },
    })

    await page.goto('/')
    await expect(page.locator('.subs')).toBeVisible({ timeout: 10000 })

    await page.setViewportSize({ width: 1280, height: 555 })

    await expect
      .poll(() =>
        page.locator('.app').evaluate((el) => (el as HTMLElement).style.height),
      )
      .toBe('555px')
  })
})

describe('AppContext#updateNowPlayingHeight', () => {
  test('persists the height to local storage once the debounce elapses', async ({
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

    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/subs/channel-1?nowPlaying=resize-1')
    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })

    const resizer = page.locator('.resizer')
    const box = (await resizer.boundingBox())!

    await page.mouse.move(box.x + box.width / 2, box.y)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2, 321)
    await page.mouse.up()

    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('nowPlayingHeight')))
      .toBe('321')
  })
})

describe('AppContext#toggleAutoPlay', () => {
  test('persists the toggled value to local storage once the debounce elapses', async ({
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
      videos: [createVideo({ id: 'auto123', title: 'Auto Play Video' })],
    })

    await page.goto('/subs/channel-1?nowPlaying=auto123')
    await expect(page.locator('.toggle-auto-play.enabled')).toBeVisible({
      timeout: 10000,
    })

    await page.locator('.toggle-auto-play').click()
    await expect(page.locator('.toggle-auto-play:not(.enabled)')).toBeVisible()

    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('autoPlayEnabled')))
      .toBe('false')
  })

  test('hydrates autoPlayEnabled from local storage on load', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.autoPlayEnabled = JSON.stringify(false)
    })

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
      videos: [createVideo({ id: 'auto456', title: 'Auto Play Video 2' })],
    })

    await page.goto('/subs/channel-1?nowPlaying=auto456')

    await expect(page.locator('.toggle-auto-play:not(.enabled)')).toBeVisible({
      timeout: 10000,
    })
  })
})
