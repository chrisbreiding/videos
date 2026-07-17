import { test, expect } from './util/coverage-fixture'
import { stubFirebaseAuth } from './util/helpers'

const { describe } = test

// This file directly exercises the couple of branches in
// src/videos/videos-store.js that aren't already reached indirectly through
// the app-level specs (e.g. videos.spec.js): the "video1 published before
// video2" sort branch, and nextVideoId's not-found/last-video branches.

describe('videos/videos-store', () => {
  test('videos getter sorts newer videos before older ones', async ({ page }) => {
    await stubFirebaseAuth(page)
    await page.goto('/')
    await expect(page.locator('.subs')).toBeVisible({ timeout: 10000 })

    const titles = await page.evaluate(async () => {
      const { videosStore } = await import('/src/videos/videos-store.ts')

      videosStore._updateVideosData({
        videos: [
          { id: 'video-1', title: 'Older Video', published: '2024-01-01T00:00:00Z' },
          { id: 'video-2', title: 'Newer Video', published: '2024-02-01T00:00:00Z' },
        ],
      })

      return videosStore.videos.map((video: { title: string }) => video.title)
    })

    expect(titles).toEqual(['Newer Video', 'Older Video'])
  })

  test('nextVideoId returns null when the given video id is not found', async ({ page }) => {
    await stubFirebaseAuth(page)
    await page.goto('/')
    await expect(page.locator('.subs')).toBeVisible({ timeout: 10000 })

    const result = await page.evaluate(async () => {
      const { videosStore } = await import('/src/videos/videos-store.ts')

      videosStore._updateVideosData({
        videos: [
          { id: 'video-1', title: 'Video 1', published: '2024-01-01T00:00:00Z' },
          { id: 'video-2', title: 'Video 2', published: '2024-01-02T00:00:00Z' },
        ],
      })

      return videosStore.nextVideoId('missing-video')
    })

    expect(result).toBe(null)
  })

  test('nextVideoId returns null when the given video is the last one', async ({ page }) => {
    await stubFirebaseAuth(page)
    await page.goto('/')
    await expect(page.locator('.subs')).toBeVisible({ timeout: 10000 })

    const result = await page.evaluate(async () => {
      const { videosStore } = await import('/src/videos/videos-store.ts')

      videosStore._updateVideosData({
        videos: [
          { id: 'video-1', title: 'Video 1', published: '2024-01-02T00:00:00Z' },
          { id: 'video-2', title: 'Video 2', published: '2024-01-01T00:00:00Z' },
        ],
      })

      return videosStore.nextVideoId('video-2')
    })

    expect(result).toBe(null)
  })
})
