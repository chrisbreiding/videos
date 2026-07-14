import { test, expect } from './util/coverage-fixture'
import { setupApp, createChannel, createPlaylist, createCustomPlaylist, createVideo } from './util/helpers'

const { describe } = test

describe('Viewing a Channel and Its Videos', () => {
  test('displays channel videos when clicking on a channel', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'Tech Reviews',
          playlistId: 'UU123',
          order: 0,
        }),
      },
      videos: [
        createVideo({ id: 'video-1', title: 'iPhone Review', duration: 'PT10M30S' }),
        createVideo({ id: 'video-2', title: 'Android Review', duration: 'PT15M0S' }),
        createVideo({ id: 'video-3', title: 'Laptop Comparison', duration: 'PT20M45S' }),
      ],
    })

    await page.goto('/')
    await expect(page.getByText('Tech Reviews')).toBeVisible({ timeout: 10000 })

    // Click on the channel
    await page.locator('.sub-item').filter({ hasText: 'Tech Reviews' }).locator('.sub-title').click()

    await expect(page).toHaveURL('/subs/channel-1')

    // Videos should be visible
    await expect(page.getByText('iPhone Review')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Android Review')).toBeVisible()
    await expect(page.getByText('Laptop Comparison')).toBeVisible()
  })

  test('shows video duration and publish date', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'My Channel', playlistId: 'UU123', order: 0 }),
      },
      videos: [
        createVideo({
          id: 'video-1',
          title: 'Test Video',
          duration: 'PT13M19S',
          published: '2024-01-15T12:00:00Z',
        }),
      ],
    })

    await page.goto('/subs/channel-1')

    await expect(page.locator('.video')).toBeVisible({ timeout: 10000 })
    // Duration should be displayed
    await expect(page.locator('.duration')).toBeVisible()
    // Publish date should be displayed
    await expect(page.locator('.pub-date')).toBeVisible()
  })
})

describe('Adding Videos to a Custom Playlist from a Channel', () => {
  test('can add a video to a custom playlist', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'My Channel', playlistId: 'UU123', order: 0 }),
        'custom-0': createCustomPlaylist({ id: 'custom-0', title: 'Watch Later', order: 1 }),
      },
      videos: [
        createVideo({ id: 'video-1', title: 'Great Video' }),
        createVideo({ id: 'video-2', title: 'Another Video' }),
      ],
    })

    await page.goto('/subs/channel-1')

    // Wait for videos to load
    await expect(page.getByText('Great Video')).toBeVisible({ timeout: 10000 })

    // Find the playlist picker on the first video
    await expect(page.locator('.playlist-picker').first()).toBeVisible()
    await expect(page.getByText('Playlists:').first()).toBeVisible()

    // Click to add to the custom playlist
    await page.locator('.playlist-picker button').filter({ hasText: 'Watch Later' }).first().click()

    // The checkbox icon should change to checked
    await expect(page.locator('.playlist-picker button').filter({ hasText: 'Watch Later' }).first().locator('.fa-check-square')).toBeVisible()
  })

  test('can remove a video from a custom playlist', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'My Channel', playlistId: 'UU123', order: 0 }),
        'custom-0': createCustomPlaylist({
          id: 'custom-0',
          title: 'Watch Later',
          order: 1,
          videos: { 'video-1': { id: 'video-1', order: 0 } },
        }),
      },
      videos: [
        createVideo({ id: 'video-1', title: 'Already Added Video' }),
      ],
    })

    await page.goto('/subs/channel-1')

    await expect(page.getByText('Already Added Video')).toBeVisible({ timeout: 10000 })

    // Video should already be checked in the playlist
    await expect(page.locator('.playlist-picker button').filter({ hasText: 'Watch Later' }).first().locator('.fa-check-square')).toBeVisible()

    // Click to remove from playlist
    await page.locator('.playlist-picker button').filter({ hasText: 'Watch Later' }).first().click()

    // Should now show unchecked
    await expect(page.locator('.playlist-picker button').filter({ hasText: 'Watch Later' }).first().locator('.fa-square-o')).toBeVisible()
  })
})

describe('Viewing a Custom Playlist Without Videos', () => {
  test('shows empty message when custom playlist has no videos', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'custom-0': createCustomPlaylist({ id: 'custom-0', title: 'Empty Playlist', order: 0 }),
      },
      videos: [],
    })

    await page.goto('/subs/custom-0')

    // Should show the empty videos message
    await expect(page.locator('.videos-empty')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('No videos')).toBeVisible()
  })
})

describe('Viewing a Custom Playlist With Videos', () => {
  test('displays videos in custom playlist', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'custom-0': createCustomPlaylist({
          id: 'custom-0',
          title: 'My Favorites',
          order: 0,
          videos: {
            'video-1': { id: 'video-1', order: 0 },
            'video-2': { id: 'video-2', order: 1 },
          },
        }),
      },
      videos: [
        createVideo({ id: 'video-1', title: 'Favorite Video 1' }),
        createVideo({ id: 'video-2', title: 'Favorite Video 2' }),
      ],
    })

    await page.goto('/subs/custom-0')

    await expect(page.getByText('Favorite Video 1')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Favorite Video 2')).toBeVisible()
  })

  test('custom playlist videos can be reordered (sortable)', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'custom-0': createCustomPlaylist({
          id: 'custom-0',
          title: 'My Playlist',
          order: 0,
          videos: {
            'video-1': { id: 'video-1', order: 0 },
          },
        }),
      },
      videos: [createVideo({ id: 'video-1', title: 'Draggable Video' })],
    })

    await page.goto('/subs/custom-0')

    await expect(page.getByText('Draggable Video')).toBeVisible({ timeout: 10000 })

    // Custom playlists should have sortable class
    await expect(page.locator('.videos-is-sortable')).toBeVisible()
  })
})

describe('Viewing a Playlist and Its Videos', () => {
  test('displays playlist videos', async ({ page }) => {
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
        createVideo({ id: 'video-1', title: 'Playlist Video 1' }),
        createVideo({ id: 'video-2', title: 'Playlist Video 2' }),
      ],
    })

    await page.goto('/subs/playlist-1')

    await expect(page.getByText('Playlist Video 1')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Playlist Video 2')).toBeVisible()
  })
})

describe('Paginating Through a Channel', () => {
  test('can navigate to older videos', async ({ page }) => {
    // Need 25+ videos for pagination to work (RESULTS_PER_PAGE check in youtube.js)
    const videos = Array.from({ length: 25 }, (_, i) =>
      createVideo({ id: `video-${i + 1}`, title: `Channel Video ${i + 1}` })
    )

    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'Popular Channel', playlistId: 'UU123', order: 0 }),
      },
      videos,
      nextPageToken: 'PAGE_TOKEN_2',
    })

    await page.goto('/subs/channel-1')

    // Use exact match to avoid matching "Channel Video 10" etc.
    await expect(page.getByRole('heading', { name: 'Channel Video 1', exact: true })).toBeVisible({ timeout: 10000 })

    // Older button should be visible (there's one at top and bottom, use first)
    await expect(page.getByText('Older').first()).toBeVisible()
  })

  test('can navigate backwards and forwards', async ({ page }) => {
    // Need 25+ videos for pagination to work
    const page1Videos = Array.from({ length: 25 }, (_, i) =>
      createVideo({ id: `video-p1-${i + 1}`, title: `First Page Vid ${i + 1}` })
    )
    const page2Videos = Array.from({ length: 25 }, (_, i) =>
      createVideo({ id: `video-p2-${i + 1}`, title: `Second Page Vid ${i + 1}` })
    )

    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'My Channel', playlistId: 'UU123', order: 0 }),
      },
      videos: [...page1Videos, ...page2Videos],
      pagination: {
        'default': {
          videos: page1Videos,
          nextPageToken: 'PAGE_2',
        },
        'PAGE_2': {
          videos: page2Videos,
          prevPageToken: 'PAGE_1',
        },
      },
    })

    await page.goto('/subs/channel-1')

    // Use exact match to avoid matching "First Page Vid 10" etc.
    await expect(page.getByRole('heading', { name: 'First Page Vid 1', exact: true })).toBeVisible({ timeout: 10000 })

    // Navigate to older (page 2) - there's a paginator at top and bottom
    await page.getByText('Older').first().click()

    await expect(page).toHaveURL(/\/page\/PAGE_2/)
  })
})

describe('Paginating Through a Playlist', () => {
  test('playlist pagination works', async ({ page }) => {
    // Need 25+ videos for pagination to work (RESULTS_PER_PAGE check in youtube.js)
    const videos = Array.from({ length: 25 }, (_, i) =>
      createVideo({ id: `video-${i + 1}`, title: `Playlist Vid ${i + 1}` })
    )

    await setupApp(page, {
      subs: {
        'playlist-1': createPlaylist({
          id: 'playlist-1',
          title: 'Long Playlist',
          playlistId: 'PL123',
          order: 0,
        }),
      },
      videos,
      nextPageToken: 'NEXT_PAGE',
    })

    await page.goto('/subs/playlist-1')

    // Use exact match to avoid matching "Playlist Vid 10" etc.
    await expect(page.getByRole('heading', { name: 'Playlist Vid 1', exact: true })).toBeVisible({ timeout: 10000 })
    // There's a paginator at top and bottom
    await expect(page.getByText('Older').first()).toBeVisible()
  })
})
