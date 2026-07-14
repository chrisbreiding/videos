import { test, expect } from './util/coverage-fixture'
import { setupApp, createChannel, createPlaylist, createCustomPlaylist, createVideo, createSearchPlaylist } from './util/helpers'

const { describe } = test

describe('No Subscriptions', () => {
  test('redirects to add-channel page when no subscriptions exist', async ({ page }) => {
    await setupApp(page, { subs: {} })

    await page.goto('/')

    await expect(page).toHaveURL(/\/add-channel/)
  })

  test('shows empty message when navigating to add-channel without subs', async ({ page }) => {
    await setupApp(page, { subs: {} })

    await page.goto('/add-channel')

    await expect(page.locator('.add-channel')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('input[placeholder="Search Channels"]')).toBeVisible()
  })
})

describe('Adding a Channel', () => {
  test('can search for and add a channel', async ({ page }) => {
    await setupApp(page, {
      subs: {},
      search: [
        createChannel({ id: 'channel-1', title: 'Test Channel 1' }),
        createChannel({ id: 'channel-2', title: 'Test Channel 2' }),
      ],
      channels: [{ contentDetails: { relatedPlaylists: { uploads: 'UU123' } } }],
    })

    await page.goto('/add-channel')

    // Search for a channel
    const searchInput = page.locator('input[placeholder="Search Channels"]')
    await searchInput.fill('Test')
    await page.locator('.add-channel form button').click()

    // Wait for search results
    await expect(page.getByText('Test Channel 1')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Test Channel 2')).toBeVisible()

    // Add the first channel
    await page.locator('.channel-item').first().locator('.add-button').click()

    // Channel should show as subscribed
    await expect(page.locator('.channel-item.is-subscribed').first()).toBeVisible()
  })
})

describe('Adding Multiple Channels', () => {
  test('can add multiple channels from search results', async ({ page }) => {
    await setupApp(page, {
      subs: {},
      search: [
        createChannel({ id: 'channel-1', title: 'First Channel' }),
        createChannel({ id: 'channel-2', title: 'Second Channel' }),
        createChannel({ id: 'channel-3', title: 'Third Channel' }),
      ],
      channels: [{ contentDetails: { relatedPlaylists: { uploads: 'UU123' } } }],
    })

    await page.goto('/add-channel')

    const searchInput = page.locator('input[placeholder="Search Channels"]')
    await searchInput.fill('Channel')
    await page.locator('.add-channel form button').click()

    // Wait for results
    await expect(page.getByText('First Channel')).toBeVisible({ timeout: 10000 })

    // Add all three channels
    const channelItems = page.locator('.channel-item')
    await channelItems.nth(0).locator('.add-button').click()
    await expect(channelItems.nth(0)).toHaveClass(/is-subscribed/)

    await channelItems.nth(1).locator('.add-button').click()
    await expect(channelItems.nth(1)).toHaveClass(/is-subscribed/)

    await channelItems.nth(2).locator('.add-button').click()
    await expect(channelItems.nth(2)).toHaveClass(/is-subscribed/)
  })
})

describe('Viewing All Subs', () => {
  test('displays All Subs view with videos from all channels', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'Channel One', playlistId: 'UU111', order: 0 }),
        'channel-2': createChannel({ id: 'channel-2', title: 'Channel Two', playlistId: 'UU222', order: 1 }),
      },
      videos: [
        createVideo({ id: 'video-1', title: 'Video from Channel One' }),
        createVideo({ id: 'video-2', title: 'Video from Channel Two' }),
      ],
    })

    await page.goto('/')

    // All Subs should be visible in sidebar
    await expect(page.getByRole('heading', { name: 'All Subs' })).toBeVisible({ timeout: 10000 })

    // Videos should be displayed
    await expect(page.locator('.videos-list')).toBeVisible({ timeout: 10000 })
  })

  test('clicking All Subs shows aggregated videos', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'My Channel', playlistId: 'UU123', order: 0 }),
      },
      videos: [
        createVideo({ id: 'video-1', title: 'Test Video' }),
      ],
    })

    await page.goto('/subs/channel-1')
    await expect(page.locator('.videos-list')).toBeVisible({ timeout: 10000 })

    // Click All Subs
    await page.locator('.all-subs .sub-title').click()
    await expect(page).toHaveURL('/')
  })
})

describe('Loading Playlists and Adding a Playlist', () => {
  test('can load playlists for a channel and add one', async ({ page }) => {
    await setupApp(page, {
      subs: {},
      search: [
        createChannel({ id: 'channel-1', title: 'Channel With Playlists' }),
      ],
      playlists: [
        createSearchPlaylist({ id: 'playlist-1', title: 'Awesome Playlist', count: 42 }),
        createSearchPlaylist({ id: 'playlist-2', title: 'Another Playlist', count: 10 }),
      ],
    })

    await page.goto('/add-channel')

    // Search for channel
    const searchInput = page.locator('input[placeholder="Search Channels"]')
    await searchInput.fill('Playlists')
    await page.locator('.add-channel form button').click()

    // Wait for results
    await expect(page.getByText('Channel With Playlists')).toBeVisible({ timeout: 10000 })

    // Load playlists. The channel list re-renders as subscription data settles,
    // which can drop a single click, so retry the click until the load actually
    // takes effect. The button flips to "Hide playlists" only after the
    // /playlists response resolves and the component commits, so asserting on it
    // synchronizes on both the network and the rendered state.
    await expect(async () => {
      await page.getByRole('button', { name: 'Load playlists' }).click()
      await expect(page.getByRole('button', { name: 'Hide playlists' })).toBeVisible({ timeout: 2000 })
    }).toPass()

    // Playlists should now be rendered; target the structural playlist item
    await expect(page.locator('.playlist-item', { hasText: 'Awesome Playlist' })).toBeVisible()
    await expect(page.getByText('42 videos')).toBeVisible()

    // Add a playlist
    await page.locator('.playlist-item').first().locator('button').click()

    // Playlist should show as subscribed
    await expect(page.locator('.playlist-item.is-subscribed').first()).toBeVisible()
  })

  test('can filter playlists when loaded', async ({ page }) => {
    await setupApp(page, {
      subs: {},
      search: [
        createChannel({ id: 'channel-1', title: 'Channel' }),
      ],
      playlists: [
        createSearchPlaylist({ id: 'playlist-1', title: 'Gaming Videos' }),
        createSearchPlaylist({ id: 'playlist-2', title: 'Cooking Tutorials' }),
        createSearchPlaylist({ id: 'playlist-3', title: 'Gaming Highlights' }),
      ],
    })

    await page.goto('/add-channel')

    const searchInput = page.locator('input[placeholder="Search Channels"]')
    await searchInput.fill('Channel')
    await page.locator('.add-channel form button').click()

    await expect(page.getByRole('heading', { name: 'Channel' })).toBeVisible({ timeout: 10000 })

    // Retry the click until the load takes effect (see the sibling test above)
    await expect(async () => {
      await page.getByRole('button', { name: 'Load playlists' }).click()
      await expect(page.getByRole('button', { name: 'Hide playlists' })).toBeVisible({ timeout: 2000 })
    }).toPass()

    await expect(page.locator('.playlists-list .playlist-item')).toHaveCount(3, { timeout: 10000 })

    // Filter playlists
    await page.locator('input[placeholder="Filter playlists"]').fill('Gaming')

    // Should only show matching playlists
    await expect(page.locator('.playlists-list .playlist-item')).toHaveCount(2)
    await expect(page.getByText('2 matching')).toBeVisible()
  })
})

describe('Adding a Custom Playlist', () => {
  test('can create a custom playlist', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'Existing Channel', order: 0 }),
      },
      videos: [],
    })

    await page.goto('/')
    await expect(page.locator('.subs-list')).toBeVisible({ timeout: 10000 })

    // Navigate to add custom playlist
    await page.getByRole('link', { name: /Custom Playlist/ }).click()
    await expect(page).toHaveURL('/add-custom-playlist')

    // Fill in the title
    await page.locator('.add-custom-playlist input').fill('My Watch Later')

    // Submit the form
    await page.locator('.add-custom-playlist button.submit').click()

    // Should redirect to the new custom playlist
    await expect(page).toHaveURL(/\/subs\/custom-/)
  })

  test('can pick an icon for custom playlist', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'Channel', order: 0 }),
      },
      videos: [],
    })

    await page.goto('/add-custom-playlist')
    await expect(page.locator('.add-custom-playlist')).toBeVisible({ timeout: 10000 })

    // Click the icon picker button
    await page.locator('.pick-icon').click()

    // Icon picker modal should appear
    await expect(page.locator('.icon-picker-modal')).toBeVisible()

    // Close modal
    await page.locator('.modal-close').click()
    await expect(page.locator('.icon-picker-modal')).not.toBeVisible()
  })
})

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

describe('Playing a Video', () => {
  test('can open video player', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'My Channel', playlistId: 'UU123', order: 0 }),
      },
      videos: [
        createVideo({ id: 'abc123', title: 'Watch This Video' }),
      ],
    })

    await page.goto('/subs/channel-1')

    await expect(page.getByText('Watch This Video')).toBeVisible({ timeout: 10000 })

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
        'channel-1': createChannel({ id: 'channel-1', title: 'My Channel', playlistId: 'UU123', order: 0 }),
      },
      videos: [
        createVideo({ id: 'xyz789', title: 'Closeable Video' }),
      ],
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
        'channel-1': createChannel({ id: 'channel-1', title: 'My Channel', playlistId: 'UU123', order: 0 }),
      },
      videos: [
        createVideo({ id: 'desc123', title: 'Video With Description', description: 'This is the video description' }),
      ],
    })

    await page.goto('/subs/channel-1?nowPlaying=desc123')

    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })

    // Toggle description
    await page.locator('.toggle-description').click()

    // Description should be visible
    await expect(page.locator('.now-playing.is-showing-description')).toBeVisible()
  })

  test('can toggle auto-play', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'My Channel', playlistId: 'UU123', order: 0 }),
      },
      videos: [
        createVideo({ id: 'auto123', title: 'Auto Play Video' }),
      ],
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

  test('updates page title when playing video', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'My Channel', playlistId: 'UU123', order: 0 }),
      },
      videos: [
        createVideo({ id: 'title123', title: 'Amazing Video Title' }),
      ],
    })

    await page.goto('/subs/channel-1?nowPlaying=title123')

    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })

    // Page title should include the video title
    await expect(page).toHaveTitle(/Amazing Video Title/)
  })
})
