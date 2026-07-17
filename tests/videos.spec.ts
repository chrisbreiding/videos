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

describe('Searching Within a Channel', () => {
  test('submits the channel search and updates the URL', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'Tech Reviews', playlistId: 'UU123', order: 0 }),
      },
      videos: [
        createVideo({ id: 'video-1', title: 'iPhone Review' }),
      ],
    })

    await page.goto('/subs/channel-1')

    // Wait for the channel view (and its search box) to render
    const searchInput = page.locator('.search input[placeholder="Search Channel"]')
    await expect(searchInput).toBeVisible({ timeout: 10000 })

    // Type a query and submit the form via the button
    await searchInput.fill('React')
    await page.locator('.search button').click()

    // Submitting calls onSearch, which pushes the query into the URL
    await expect(page).toHaveURL(/\/subs\/channel-1\?search=React/)
  })

  test('submits the search when pressing Enter in the input', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'Tech Reviews', playlistId: 'UU123', order: 0 }),
      },
      videos: [
        createVideo({ id: 'video-1', title: 'iPhone Review' }),
      ],
    })

    await page.goto('/subs/channel-1')

    const searchInput = page.locator('.search input[placeholder="Search Channel"]')
    await expect(searchInput).toBeVisible({ timeout: 10000 })

    await searchInput.fill('Playwright')
    await searchInput.press('Enter')

    await expect(page).toHaveURL(/\/subs\/channel-1\?search=Playwright/)
  })

  test('shows only the videos matching the channel search query', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'Tech Reviews', playlistId: 'UU123', order: 0 }),
      },
      videos: [
        createVideo({ id: 'video-1', title: 'iPhone Review', channelId: 'channel-1' }),
        createVideo({ id: 'video-2', title: 'Android Review', channelId: 'channel-1' }),
      ],
    })

    await page.goto('/subs/channel-1')

    const searchInput = page.locator('.search input[placeholder="Search Channel"]')
    await expect(searchInput).toBeVisible({ timeout: 10000 })

    await searchInput.fill('iPhone')
    await page.locator('.search button').click()

    await expect(page.getByText('iPhone Review')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Android Review')).not.toBeVisible()
  })

  test('shows only the videos matching a playlist search query', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'playlist-1': createPlaylist({ id: 'playlist-1', title: 'Cool Playlist', playlistId: 'PL123', order: 0 }),
      },
      videos: [
        createVideo({ id: 'video-1', title: 'iPhone Review' }),
        createVideo({ id: 'video-2', title: 'Android Review' }),
      ],
    })

    await page.goto('/subs/playlist-1')

    const searchInput = page.locator('.search input[placeholder="Search Channel"]')
    await expect(searchInput).toBeVisible({ timeout: 10000 })

    await searchInput.fill('Android')
    await page.locator('.search button').click()

    await expect(page.getByText('Android Review')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('iPhone Review')).not.toBeVisible()
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
    await expect(page.locator('.playlist-picker button').filter({ hasText: 'Watch Later' }).first().locator('.fa-square-check')).toBeVisible()
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
    await expect(page.locator('.playlist-picker button').filter({ hasText: 'Watch Later' }).first().locator('.fa-square-check')).toBeVisible()

    // Click to remove from playlist
    await page.locator('.playlist-picker button').filter({ hasText: 'Watch Later' }).first().click()

    // Should now show unchecked
    await expect(page.locator('.playlist-picker button').filter({ hasText: 'Watch Later' }).first().locator('.fa-square')).toBeVisible()
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

  test('dragging a video by its handle reorders the custom playlist', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'custom-0': createCustomPlaylist({
          id: 'custom-0',
          title: 'My Playlist',
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

    // Move in small steps to give dnd-kit a chance to track the drag
    const steps = 10
    for (let i = 1; i <= steps; i++) {
      const y = firstHandleBox.y + ((secondItemBox.y + secondItemBox.height - firstHandleBox.y) * i) / steps
      await page.mouse.move(firstHandleBox.x + firstHandleBox.width / 2, y)
    }

    await page.mouse.up()

    // The videos should now be swapped
    await expect.poll(() => page.locator('.video h4').allTextContents()).not.toEqual(['First Video', 'Second Video'])
  })

  test('canceling a video drag with escape leaves the order unchanged', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'custom-0': createCustomPlaylist({
          id: 'custom-0',
          title: 'My Playlist',
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
      const y = firstHandleBox.y + ((secondItemBox.y + secondItemBox.height - firstHandleBox.y) * i) / steps
      await page.mouse.move(firstHandleBox.x + firstHandleBox.width / 2, y)
    }

    await page.keyboard.press('Escape')
    await page.mouse.up()

    // Order should be unchanged since the drag was canceled
    await expect.poll(() => page.locator('.video h4').allTextContents()).toEqual(['First Video', 'Second Video'])
  })

  test('dragging videos after navigating from the All Subs page reorders correctly', async ({ page }) => {
    const pageErrors: string[] = []
    page.on('pageerror', (err) => pageErrors.push(err.message))

    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'My Channel', order: 0 }),
        'custom-0': createCustomPlaylist({
          id: 'custom-0',
          title: 'My Playlist',
          order: 1,
          videos: {
            'video-1': { id: 'video-1', order: 0 },
            'video-2': { id: 'video-2', order: 1 },
            'video-3': { id: 'video-3', order: 2 },
            'video-4': { id: 'video-4', order: 3 },
          },
        }),
      },
      videos: [
        createVideo({ id: 'video-1', title: 'First Video' }),
        createVideo({ id: 'video-2', title: 'Second Video' }),
        createVideo({ id: 'video-3', title: 'Third Video' }),
        createVideo({ id: 'video-4', title: 'Fourth Video' }),
      ],
    })

    await page.goto('/')

    // Navigate to the custom playlist from the All Subs page
    await page.locator('.custom-sub-item .sub-title').click()

    await expect(page.getByText('First Video')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.video h4').allTextContents()).resolves.toEqual([
      'First Video', 'Second Video', 'Third Video', 'Fourth Video',
    ])

    // Drag the 1st video into the 3rd position
    const handles = page.locator('.video-sort-handle')
    const firstHandleBox = (await handles.nth(0).boundingBox())!
    const thirdItemBox = (await page.locator('.video').nth(2).boundingBox())!

    await page.mouse.move(
      firstHandleBox.x + firstHandleBox.width / 2,
      firstHandleBox.y + firstHandleBox.height / 2,
    )
    await page.mouse.down()

    // Move in small steps to give dnd-kit a chance to track the drag
    const steps = 10
    for (let i = 1; i <= steps; i++) {
      const y = firstHandleBox.y + ((thirdItemBox.y + thirdItemBox.height / 2 - firstHandleBox.y) * i) / steps
      await page.mouse.move(firstHandleBox.x + firstHandleBox.width / 2, y)
    }

    await page.mouse.up()

    // The first video should now be in the 3rd position, with no runtime errors
    await expect.poll(() => page.locator('.video h4').allTextContents()).toEqual([
      'Second Video', 'Third Video', 'First Video', 'Fourth Video',
    ])
    expect(pageErrors).toEqual([])
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
      createVideo({ id: `video-${i + 1}`, title: `Channel Video ${i + 1}` }),
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
      createVideo({ id: `video-p1-${i + 1}`, title: `First Page Vid ${i + 1}` }),
    )
    const page2Videos = Array.from({ length: 25 }, (_, i) =>
      createVideo({ id: `video-p2-${i + 1}`, title: `Second Page Vid ${i + 1}` }),
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
      createVideo({ id: `video-${i + 1}`, title: `Playlist Vid ${i + 1}` }),
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
