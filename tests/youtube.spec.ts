import { test, expect } from './util/coverage-fixture'
import { stubFirebaseAuth, setupApp, createVideo } from './util/helpers'

const { describe } = test

// This file directly exercises the few branches/paths of src/lib/youtube.js
// that aren't already reached indirectly through the app-level specs (e.g.
// videos.spec.js, subs.spec.js): a failed API key check, paginating a
// channel search, and paginating through an entire playlist search.

describe('lib/youtube', () => {
  test('checkApiKey resolves false when the request fails', async ({ page }) => {
    await stubFirebaseAuth(page)
    await page.route('https://www.googleapis.com/youtube/v3/activities**', (route) => route.abort())
    await page.goto('/')
    await expect(page.locator('.subs')).toBeVisible({ timeout: 10000 })

    const result = await page.evaluate(async () => {
      const { checkApiKey } = await import('/src/lib/youtube.ts')

      return checkApiKey('some-api-key')
    })

    expect(result).toBe(false)
  })

  test('getVideosDataForChannelSearch includes the page token when paginating', async ({ page }) => {
    await stubFirebaseAuth(page)

    let requestedUrl: string | undefined
    await page.route('https://www.googleapis.com/youtube/v3/search**', async (route, request) => {
      requestedUrl = request.url()
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [] }),
      })
    })
    await page.route('https://www.googleapis.com/youtube/v3/videos**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [] }),
      })
    })
    await page.goto('/')
    await expect(page.locator('.subs')).toBeVisible({ timeout: 10000 })

    await page.evaluate(async () => {
      const { getVideosDataForChannelSearch } = await import('/src/lib/youtube.ts')

      return getVideosDataForChannelSearch('channel-1', 'query', 'page-token-abc')
    })

    expect(requestedUrl).toContain('pageToken=page-token-abc')
  })

  test('getVideosDataForChannelSearch keeps the next page token when a full page of results comes back', async ({ page }) => {
    await stubFirebaseAuth(page)

    const searchItems = Array.from({ length: 25 }, (_, i) => ({
      id: { videoId: `video-${i}` },
    }))
    const videoItems = searchItems.map(({ id }) => ({
      id: id.videoId,
      snippet: {
        channelId: 'channel-1',
        title: id.videoId,
        description: '',
        publishedAt: '2024-01-01T00:00:00Z',
        thumbnails: { medium: { url: 'https://example.com/thumb.jpg' } },
      },
      contentDetails: { duration: 'PT1M' },
    }))

    await page.route('https://www.googleapis.com/youtube/v3/search**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: searchItems, nextPageToken: 'next-page-token' }),
      })
    })
    await page.route('https://www.googleapis.com/youtube/v3/videos**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: videoItems }),
      })
    })
    await page.goto('/')
    await expect(page.locator('.subs')).toBeVisible({ timeout: 10000 })

    const result = await page.evaluate(async () => {
      const { getVideosDataForChannelSearch } = await import('/src/lib/youtube.ts')

      return getVideosDataForChannelSearch('channel-1', 'query')
    })

    expect(result.videos).toHaveLength(25)
    expect(result.nextPageToken).toBe('next-page-token')
  })

  test('getVideosDataForPlaylistSearch fetches every page of a playlist before filtering', async ({ page }) => {
    const videoOnFirstPage = createVideo({ id: 'video-1', title: 'Apple Review', description: 'about fruit' })
    const videoOnSecondPage = createVideo({ id: 'video-2', title: 'Banana Review', description: 'also about fruit' })

    await setupApp(page, {
      videos: [videoOnFirstPage, videoOnSecondPage],
      pagination: {
        default: { videos: [videoOnFirstPage], nextPageToken: 'page-2' },
        'page-2': { videos: [videoOnSecondPage], nextPageToken: undefined },
      },
    })
    await page.goto('/')
    await expect(page.locator('.subs')).toBeVisible({ timeout: 10000 })

    const result = await page.evaluate(async () => {
      const { getVideosDataForPlaylistSearch } = await import('/src/lib/youtube.ts')

      return getVideosDataForPlaylistSearch('UU123', 'apple')
    })

    expect(result.videos).toHaveLength(1)
    expect(result.videos[0].id).toBe('video-1')
    expect(result.prevPageToken).toBeNull()
    expect(result.nextPageToken).toBeNull()
  })
})
