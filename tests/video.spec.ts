import { test, expect } from './util/coverage-fixture'
import { setupApp, createChannel, createVideo } from './util/helpers'

const { describe } = test

describe('Watch Progress Bar', () => {
  test('shows a progress bar for a partially-watched video', async ({
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
          id: 'video-1',
          title: 'Half Watched Video',
          duration: 'PT10M0S',
        }),
      ],
      // 300s watched out of 600s total => 50%
      watchedVideos: {
        'video-1': { watchTimestamp: 300, updatedAt: '2024-01-01T00:00:00Z' },
      },
    })

    await page.goto('/subs/channel-1')

    await expect(page.getByText('Half Watched Video')).toBeVisible({
      timeout: 10000,
    })

    // The progress bar should render, filled to the watched percentage
    const progressBar = page.locator('.watch-progress .watch-progress-bar')
    await expect(progressBar).toBeVisible()
    await expect(progressBar).toHaveAttribute('style', /width:\s*50%/)
  })

  test('does not show a progress bar when barely watched', async ({ page }) => {
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
          title: 'Barely Watched Video',
          duration: 'PT10M0S',
        }),
      ],
      // 5s watched out of 600s total => ~0.8%, below the 2% threshold
      watchedVideos: {
        'video-1': { watchTimestamp: 5, updatedAt: '2024-01-01T00:00:00Z' },
      },
    })

    await page.goto('/subs/channel-1')

    await expect(page.getByText('Barely Watched Video')).toBeVisible({
      timeout: 10000,
    })
    await expect(page.locator('.watch-progress')).toHaveCount(0)
  })

  test('does not show a progress bar when the video has no length', async ({
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
        // a zero-length duration parses to 0 seconds
        createVideo({
          id: 'video-1',
          title: 'No Duration Video',
          duration: 'PT0S',
        }),
      ],
      watchedVideos: {
        'video-1': { watchTimestamp: 300, updatedAt: '2024-01-01T00:00:00Z' },
      },
    })

    await page.goto('/subs/channel-1')

    await expect(page.getByText('No Duration Video')).toBeVisible({
      timeout: 10000,
    })
    await expect(page.locator('.watch-progress')).toHaveCount(0)
  })

  test('does not show a progress bar for an unwatched video', async ({
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
          id: 'video-1',
          title: 'Unwatched Video',
          duration: 'PT10M0S',
        }),
      ],
    })

    await page.goto('/subs/channel-1')

    await expect(page.getByText('Unwatched Video')).toBeVisible({
      timeout: 10000,
    })
    await expect(page.locator('.watch-progress')).toHaveCount(0)
  })
})

describe('Removing a Video Marker', () => {
  test('removes the marker when the remove button is clicked', async ({
    page,
  }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'My Channel',
          playlistId: 'UU123',
          order: 0,
          markedVideoId: 'video-1',
        }),
      },
      videos: [
        createVideo({ id: 'video-1', title: 'Marked Video' }),
        createVideo({ id: 'video-2', title: 'Other Video' }),
      ],
    })

    await page.goto('/subs/channel-1')

    await expect(page.getByText('Marked Video')).toBeVisible({ timeout: 10000 })

    // The marked video renders the marker with its remove button
    const markedVideo = page.locator('.video.is-marked')
    await expect(markedVideo).toBeVisible()
    await expect(markedVideo.locator('.remove-video-marker')).toBeVisible()

    // Clicking remove clears the mark, so the video is no longer marked
    await markedVideo.locator('.remove-video-marker').click()

    await expect(page.locator('.video.is-marked')).toHaveCount(0)
    await expect(page.locator('.video-marker')).toHaveCount(0)
  })
})
