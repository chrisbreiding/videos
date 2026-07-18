import { test, expect } from './util/coverage-fixture'
import {
  setupApp,
  createChannel,
  createPlaylist,
  createCustomPlaylist,
  createVideo,
} from './util/helpers'
import type { ChannelSearchResult } from '../src/lib/types'

const { describe } = test

describe('Loading Videos for a Single Sub', () => {
  test('loads and displays videos for a channel sub', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'My Channel',
          playlistId: 'UU123',
          order: 0,
        }),
      },
      videos: [createVideo({ id: 'video-1', title: 'Channel Video' })],
    })

    await page.goto('/subs/channel-1')

    await expect(page.locator('main.videos')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Channel Video')).toBeVisible({
      timeout: 10000,
    })
    await expect(page).toHaveTitle(/My Channel \| Videos/)
  })

  test('loads and displays videos for a playlist sub', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'playlist-1': createPlaylist({
          id: 'playlist-1',
          title: 'My Playlist',
          playlistId: 'PL123',
          order: 0,
        }),
      },
      videos: [createVideo({ id: 'video-1', title: 'Playlist Video' })],
    })

    await page.goto('/subs/playlist-1')

    await expect(page.getByText('Playlist Video')).toBeVisible({
      timeout: 10000,
    })
    await expect(page).toHaveTitle(/My Playlist \| Videos/)
  })
})

describe('Loading All Subs', () => {
  test('loads videos aggregated from all channels and skips search/bookmark UI', async ({
    page,
  }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'Channel One',
          playlistId: 'UU111',
          order: 0,
        }),
        'channel-2': createChannel({
          id: 'channel-2',
          title: 'Channel Two',
          playlistId: 'UU222',
          order: 1,
        }),
      },
      videos: [
        createVideo({
          id: 'video-1',
          title: 'Video One',
          channelId: 'channel-1',
        }),
        createVideo({
          id: 'video-2',
          title: 'Video Two',
          channelId: 'channel-2',
        }),
      ],
    })

    await page.goto('/')

    await expect(page.locator('.videos-list')).toBeVisible({ timeout: 10000 })
    await expect(page).toHaveTitle(/All Subs \| Videos/)

    // No search box or bookmark button when there's no specific sub
    await expect(page.locator('.search')).not.toBeVisible()
    await expect(page.locator('.bookmark')).not.toBeVisible()

    // showChannelImage is true for All Subs, so each video shows its channel thumb
    await expect(page.locator('.video .channel').first()).toBeVisible()

    // Re-rendering (e.g. playing a video changes the URL/query) while already on
    // All Subs exercises the `hasLoadedAllPlaylists` short-circuit branch, since
    // it shouldn't need to refetch.
    await page.locator('.play-video').first().click()
    await expect(page).toHaveURL(/nowPlaying=video-1/)
    await expect(page.locator('.videos-list')).toBeVisible()
  })

  test('transitioning from a sub with a playlist to All Subs triggers a fresh all-playlists load', async ({
    page,
  }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'Solo Channel',
          playlistId: 'UU123',
          order: 0,
        }),
      },
      videos: [createVideo({ id: 'video-1', title: 'Solo Video' })],
    })

    await page.goto('/subs/channel-1')
    await expect(page.getByText('Solo Video')).toBeVisible({ timeout: 10000 })

    await page.locator('.all-subs .sub-title').click()

    await expect(page).toHaveURL('/')
    await expect(page.locator('.videos-list')).toBeVisible({ timeout: 10000 })
  })

  test('returning to All Subs after searching for a channel to add does not crash', async ({
    page,
  }) => {
    const search: ChannelSearchResult[] = [
      {
        id: 'channel-2',
        title: 'Found Channel',
        author: 'Found Channel',
        thumb: 'https://example.com/thumb.jpg',
      },
    ]

    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'Channel One',
          playlistId: 'UU111',
          order: 0,
        }),
      },
      videos: [
        createVideo({
          id: 'video-1',
          title: 'Video One',
          channelId: 'channel-1',
        }),
      ],
      search,
    })

    await page.goto('/')
    await expect(page.getByText('Video One')).toBeVisible({ timeout: 10000 })

    await page.locator('a[href="/add-channel"]').click()

    const searchInput = page.locator('.add-channel input')
    await searchInput.fill('Found Channel')
    await page.locator('.add-channel button').click()

    await expect(page.getByText('Found Channel')).toBeVisible({
      timeout: 10000,
    })

    await page.locator('.all-subs .sub-title').click()

    await expect(page).toHaveURL('/')
    await expect(page.getByText('Video One')).toBeVisible({ timeout: 10000 })
  })
})

describe('Searching', () => {
  test('searches within a channel sub via getVideosDataForChannelSearch', async ({
    page,
  }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'Tech Channel',
          playlistId: 'UU123',
          order: 0,
        }),
      },
      videos: [
        createVideo({
          id: 'video-1',
          title: 'iPhone Review',
          channelId: 'channel-1',
        }),
        createVideo({
          id: 'video-2',
          title: 'Android Review',
          channelId: 'channel-1',
        }),
      ],
    })

    await page.goto('/subs/channel-1')

    const searchInput = page.locator('.search input')
    await expect(searchInput).toBeVisible({ timeout: 10000 })

    await searchInput.fill('iPhone')
    await page.locator('.search button').click()

    await expect(page).toHaveURL(/search=iPhone/)
    await expect(page.getByText('iPhone Review')).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByText('Android Review')).not.toBeVisible()

    // Clearing the search field and resubmitting sends an empty search term,
    // which onSearchUpdate falls back to `undefined` for (removing it from the URL).
    await searchInput.fill('')
    await page.locator('.search button').click()

    await expect(page).not.toHaveURL(/search=/)
    await expect(page.getByText('Android Review')).toBeVisible({
      timeout: 10000,
    })
  })

  test('searches within a playlist sub via getVideosDataForPlaylistSearch', async ({
    page,
  }) => {
    await setupApp(page, {
      subs: {
        'playlist-1': createPlaylist({
          id: 'playlist-1',
          title: 'Cool Playlist',
          playlistId: 'PL123',
          order: 0,
        }),
      },
      videos: [
        createVideo({ id: 'video-1', title: 'Cats Compilation' }),
        createVideo({ id: 'video-2', title: 'Dogs Compilation' }),
      ],
    })

    await page.goto('/subs/playlist-1')

    const searchInput = page.locator('.search input')
    await expect(searchInput).toBeVisible({ timeout: 10000 })

    await searchInput.fill('Cats')
    await page.locator('.search button').click()

    await expect(page).toHaveURL(/search=Cats/)
    await expect(page.getByText('Cats Compilation')).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByText('Dogs Compilation')).not.toBeVisible()
  })
})

describe('Custom Playlists', () => {
  test('loads videos via getVideosDataForCustomPlaylist and hides search', async ({
    page,
  }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'Owner Channel',
          order: 0,
        }),
        'custom-0': createCustomPlaylist({
          id: 'custom-0',
          title: 'My Favorites',
          order: 1,
          videos: {
            'video-1': { id: 'video-1', order: 0 },
            'video-2': { id: 'video-2', order: 1 },
          },
        }),
      },
      videos: [
        createVideo({
          id: 'video-1',
          title: 'Favorite One',
          channelId: 'channel-1',
        }),
        createVideo({
          id: 'video-2',
          title: 'Favorite Two',
          channelId: 'channel-1',
        }),
      ],
    })

    await page.goto('/subs/custom-0')

    await expect(page.getByText('Favorite One')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Favorite Two')).toBeVisible()
    await expect(page).toHaveTitle(/My Favorites \| Videos/)

    // No search box for custom playlists
    await expect(page.locator('.search')).not.toBeVisible()

    // showChannelImage is true for custom playlists, and they're sortable
    await expect(page.locator('.video .channel').first()).toBeVisible()
    await expect(page.locator('.videos-is-sortable')).toBeVisible()
  })

  test('shows the empty videos message when a custom playlist has no videos', async ({
    page,
  }) => {
    await setupApp(page, {
      subs: {
        'custom-0': createCustomPlaylist({
          id: 'custom-0',
          title: 'Empty List',
          order: 0,
        }),
      },
      videos: [],
    })

    await page.goto('/subs/custom-0')

    await expect(page.locator('.videos-empty')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('No videos')).toBeVisible()
  })

  test('dragging a video handle reorders and saves the custom playlist', async ({
    page,
  }) => {
    await setupApp(page, {
      subs: {
        'custom-0': createCustomPlaylist({
          id: 'custom-0',
          title: 'Reorder Me',
          order: 0,
          videos: {
            'video-1': { id: 'video-1', order: 0 },
            'video-2': { id: 'video-2', order: 1 },
          },
        }),
      },
      videos: [
        createVideo({ id: 'video-1', title: 'First Video' }),
        createVideo({ id: 'video-2', title: 'Second Video' }),
      ],
    })

    await page.goto('/subs/custom-0')
    await expect(page.getByText('First Video')).toBeVisible({ timeout: 10000 })

    const handles = page.locator('.video-sort-handle')
    const firstHandleBox = (await handles.nth(0).boundingBox())!
    const secondItemBox = (await page.locator('.video').nth(1).boundingBox())!

    await page.mouse.move(
      firstHandleBox.x + firstHandleBox.width / 2,
      firstHandleBox.y + firstHandleBox.height / 2,
    )
    await page.mouse.down()

    const steps = 10
    for (let i = 1; i <= steps; i++) {
      const y =
        firstHandleBox.y +
        ((secondItemBox.y + secondItemBox.height - firstHandleBox.y) * i) /
          steps
      await page.mouse.move(firstHandleBox.x + firstHandleBox.width / 2, y)
    }

    await page.mouse.up()

    await expect
    .poll(() => page.locator('.video h4').allTextContents())
    .not.toEqual(['First Video', 'Second Video'])
  })

  test('dropping a video back in its original spot does not resave the order', async ({
    page,
  }) => {
    await setupApp(page, {
      subs: {
        'custom-0': createCustomPlaylist({
          id: 'custom-0',
          title: 'No Move',
          order: 0,
          videos: {
            'video-1': { id: 'video-1', order: 0 },
            'video-2': { id: 'video-2', order: 1 },
          },
        }),
      },
      videos: [
        createVideo({ id: 'video-1', title: 'Stay First' }),
        createVideo({ id: 'video-2', title: 'Stay Second' }),
      ],
    })

    await page.goto('/subs/custom-0')
    await expect(page.getByText('Stay First')).toBeVisible({ timeout: 10000 })

    const handles = page.locator('.video-sort-handle')
    const firstHandleBox = (await handles.nth(0).boundingBox())!

    await page.mouse.move(
      firstHandleBox.x + firstHandleBox.width / 2,
      firstHandleBox.y + firstHandleBox.height / 2,
    )
    await page.mouse.down()
    // Move just a couple pixels - not enough to cross into the next item's slot
    await page.mouse.move(
      firstHandleBox.x + firstHandleBox.width / 2,
      firstHandleBox.y + 2,
    )
    await page.mouse.up()

    await expect(page.locator('.video h4').first()).toHaveText('Stay First')
  })
})

describe('Pagination', () => {
  test('navigating to a page URL loads that page and shows the bookmark button', async ({
    page,
  }) => {
    const videos = Array.from({ length: 25 }, (_, i) =>
      createVideo({ id: `video-${i + 1}`, title: `Paged Video ${i + 1}` }),
    )

    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'Paged Channel',
          playlistId: 'UU123',
          order: 0,
        }),
      },
      videos,
      pagination: {
        default: { videos, nextPageToken: 'PAGE_2' },
        PAGE_2: { videos, prevPageToken: 'PAGE_1' },
      },
    })

    await page.goto('/subs/channel-1')
    await expect(
      page.getByRole('heading', { name: 'Paged Video 1', exact: true }),
    ).toBeVisible({ timeout: 10000 })

    // No bookmark button without a page token in the URL
    await expect(page.locator('.bookmark')).not.toBeVisible()

    await page.getByText('Older').first().click()
    await expect(page).toHaveURL(/\/page\/PAGE_2/)

    // A page token in the URL now shows the bookmark button
    await expect(page.locator('.bookmark')).toBeVisible({ timeout: 10000 })

    await page.getByText('Newer').first().click()
    await expect(page).toHaveURL(/\/page\/PAGE_1/)
  })
})

describe('Bookmarking a Page', () => {
  test('toggles the bookmark for a channel sub page', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'Bookmark Channel',
          playlistId: 'UU123',
          order: 0,
        }),
      },
      videos: [createVideo({ id: 'video-1', title: 'Bookmarkable Video' })],
    })

    await page.goto('/subs/channel-1/page/PAGE_A')
    await expect(page.getByText('Bookmarkable Video')).toBeVisible({
      timeout: 10000,
    })

    const bookmarkButton = page.locator('.bookmark')
    await expect(bookmarkButton).toBeVisible()
    await expect(bookmarkButton).not.toHaveClass(/is-bookmarked/)

    await bookmarkButton.click()
    await expect(bookmarkButton).toHaveClass(/is-bookmarked/)

    await bookmarkButton.click()
    await expect(bookmarkButton).not.toHaveClass(/is-bookmarked/)
  })

  test('toggles the bookmark for a custom playlist page', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'custom-0': createCustomPlaylist({
          id: 'custom-0',
          title: 'Bookmarkable List',
          order: 0,
          videos: { 'video-1': { id: 'video-1', order: 0 } },
        }),
      },
      videos: [createVideo({ id: 'video-1', title: 'Custom Bookmark Video' })],
    })

    await page.goto('/subs/custom-0/page/PAGE_B')
    await expect(page.getByText('Custom Bookmark Video')).toBeVisible({
      timeout: 10000,
    })

    const bookmarkButton = page.locator('.bookmark')
    await expect(bookmarkButton).toBeVisible()

    await bookmarkButton.click()
    await expect(bookmarkButton).toHaveClass(/is-bookmarked/)

    await bookmarkButton.click()
    await expect(bookmarkButton).not.toHaveClass(/is-bookmarked/)
  })
})

describe('Loading Indicator', () => {
  test('shows the loader while videos are being fetched', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'Slow Channel',
          playlistId: 'UU123',
          order: 0,
        }),
      },
      videos: [createVideo({ id: 'video-1', title: 'Slow Video' })],
    })

    // Delay the underlying playlistItems/videos responses so the loader has
    // time to render before the data resolves.
    await page.route(
      'https://www.googleapis.com/youtube/v3/**',
      async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 750))
        await route.fallback()
      },
    )

    await page.goto('/subs/channel-1')

    await expect(page.locator('main.videos .loader')).toBeVisible({
      timeout: 5000,
    })
    await expect(page.getByText('Slow Video')).toBeVisible({ timeout: 10000 })
  })
})

describe('Marking and Playing Videos', () => {
  test('playing a video within a sub marks it, and removing the mark clears the URL', async ({
    page,
  }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'Mark Channel',
          playlistId: 'UU123',
          order: 0,
        }),
      },
      videos: [createVideo({ id: 'video-1', title: 'Markable Video' })],
    })

    await page.goto('/subs/channel-1')
    await expect(page.getByText('Markable Video')).toBeVisible({
      timeout: 10000,
    })

    await page.locator('.play-video').first().click()
    await expect(page).toHaveURL(/nowPlaying=video-1/)

    // The now-playing video's title takes over the document title, so Sub's
    // own DocumentTitle is skipped while nowPlaying is set.
    await expect(page).toHaveTitle(/Markable Video \| Videos/)
    await expect(page).not.toHaveTitle(/Mark Channel/)

    await expect(page.locator('.video.is-marked')).toBeVisible({
      timeout: 10000,
    })
    await expect(page.locator('.video-marker')).toBeVisible()

    // Clicking the marker banner itself (not the remove icon) updates the
    // marker query param and scrolls to it.
    await page.locator('.video-marker').click()
    await expect(page).toHaveURL(/marker=video-marker/)

    // Clicking the remove icon clears the mark and the marker query param.
    await page.locator('.remove-video-marker').click()
    await expect(page).not.toHaveURL(/marker=/)
    await expect(page.locator('.video-marker')).not.toBeVisible()
    await expect(page.locator('.video.is-marked')).not.toBeVisible()
  })

  test('playing a video from All Subs marks it via appState and removing clears it', async ({
    page,
  }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'Channel A',
          playlistId: 'UU111',
          order: 0,
        }),
      },
      videos: [
        createVideo({
          id: 'video-1',
          title: 'All Subs Video',
          channelId: 'channel-1',
        }),
      ],
    })

    await page.goto('/')
    await expect(page.getByText('All Subs Video')).toBeVisible({
      timeout: 10000,
    })

    await page.locator('.play-video').first().click()
    await expect(page).toHaveURL(/nowPlaying=video-1/)

    await expect(page.locator('.video.is-marked')).toBeVisible({
      timeout: 10000,
    })

    await page.locator('.remove-video-marker').click()
    await expect(page.locator('.video.is-marked')).not.toBeVisible()
  })
})

describe('Deep Linking to a Marker', () => {
  test('deep-linking with a marker query param and no existing mark does not crash', async ({
    page,
  }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'Deep Link Channel',
          playlistId: 'UU123',
          order: 0,
        }),
      },
      videos: [createVideo({ id: 'video-1', title: 'Deep Link Video' })],
    })

    await page.goto('/subs/channel-1?marker=video-marker')

    await expect(page.getByText('Deep Link Video')).toBeVisible({
      timeout: 10000,
    })
    await expect(page.locator('main.videos')).toBeVisible()
  })

  test('deep-linking with a marker query param and an existing mark scrolls to it on load', async ({
    page,
  }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'Existing Mark Channel',
          playlistId: 'UU123',
          order: 0,
          markedVideoId: 'video-1',
        }),
      },
      videos: [createVideo({ id: 'video-1', title: 'Already Marked Video' })],
    })

    await page.goto('/subs/channel-1?marker=video-marker')

    await expect(page.locator('.video.is-marked')).toBeVisible({
      timeout: 10000,
    })
    await expect(page.locator('.video-marker')).toBeVisible()
  })
})

describe('No Subscriptions', () => {
  test('does not render a Sub route when there are no subscriptions', async ({
    page,
  }) => {
    await setupApp(page, { subs: {} })

    await page.goto('/')

    await expect(page).toHaveURL(/\/add-channel/)
    await expect(page.locator('main.videos')).not.toBeVisible()
  })

  test('removing the last subscription remotely while viewing it does not render a Sub route', async ({
    page,
  }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'Only Channel',
          playlistId: 'UU123',
          order: 0,
        }),
      },
      videos: [createVideo({ id: 'video-1', title: 'Only Video' })],
    })

    await page.goto('/subs/channel-1')
    await expect(page.getByText('Only Video')).toBeVisible({ timeout: 10000 })

    await page.evaluate(() => {
      window.__triggerSnapshotUpdate!({
        youtubeApiKey: 'fake-api-key',
        watchedVideos: {},
        subs: {},
      })
    })

    await expect(page).toHaveURL(/\/add-channel/, { timeout: 10000 })
    await expect(page.locator('main.videos')).not.toBeVisible()
  })
})
