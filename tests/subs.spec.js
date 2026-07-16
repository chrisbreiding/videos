import { test, expect } from './util/coverage-fixture'
import { setupApp, createChannel, createVideo, createSearchPlaylist, createCustomPlaylist } from './util/helpers'

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

  test('falls back to the channel author when the channel has no title', async ({ page }) => {
    await setupApp(page, {
      subs: {},
      search: [
        { id: 'channel-1', title: '', author: 'Author Only Channel', thumb: 'https://example.com/thumb.jpg' },
      ],
      channels: [{ contentDetails: { relatedPlaylists: { uploads: 'UU123' } } }],
    })

    await page.goto('/add-channel')

    const searchInput = page.locator('input[placeholder="Search Channels"]')
    await searchInput.fill('Author')
    await page.locator('.add-channel form button').click()

    await expect(page.getByText('Author Only Channel')).toBeVisible({ timeout: 10000 })
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

  test('can load more playlists when a next page is available', async ({ page }) => {
    const firstPagePlaylists = Array.from({ length: 25 }, (_, i) => (
      createSearchPlaylist({ id: `playlist-${i}`, title: `Playlist ${i}` })
    ))

    await setupApp(page, {
      subs: {},
      search: [
        createChannel({ id: 'channel-1', title: 'Channel With More Playlists' }),
      ],
      playlists: firstPagePlaylists,
      playlistsNextPageToken: 'page-2',
    })

    await page.goto('/add-channel')

    const searchInput = page.locator('input[placeholder="Search Channels"]')
    await searchInput.fill('More')
    await page.locator('.add-channel form button').click()

    await expect(page.getByText('Channel With More Playlists')).toBeVisible({ timeout: 10000 })

    await expect(async () => {
      await page.getByRole('button', { name: 'Load playlists' }).click()
      await expect(page.getByRole('button', { name: 'Hide playlists' })).toBeVisible({ timeout: 2000 })
    }).toPass()

    await expect(page.locator('.playlists-list .playlist-item')).toHaveCount(25)

    // Load more should fetch and append the next page of playlists
    const loadMoreButton = page.locator('.load-more-button')
    await expect(loadMoreButton).toBeVisible()
    await loadMoreButton.click()

    await expect(page.locator('.playlists-list .playlist-item')).toHaveCount(50, { timeout: 10000 })
  })

  test('can hide playlists after loading them', async ({ page }) => {
    await setupApp(page, {
      subs: {},
      search: [
        createChannel({ id: 'channel-1', title: 'Channel To Hide' }),
      ],
      playlists: [
        createSearchPlaylist({ id: 'playlist-1', title: 'A Playlist' }),
      ],
    })

    await page.goto('/add-channel')

    const searchInput = page.locator('input[placeholder="Search Channels"]')
    await searchInput.fill('Hide')
    await page.locator('.add-channel form button').click()

    await expect(page.getByText('Channel To Hide')).toBeVisible({ timeout: 10000 })

    await expect(async () => {
      await page.getByRole('button', { name: 'Load playlists' }).click()
      await expect(page.getByRole('button', { name: 'Hide playlists' })).toBeVisible({ timeout: 2000 })
    }).toPass()

    await expect(page.locator('.playlists-section')).toBeVisible()

    await page.getByRole('button', { name: 'Hide playlists' }).click()

    await expect(page.locator('.playlists-section')).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Load playlists' })).toBeVisible()
  })
})

describe('Leaving the Add Channel Page', () => {
  test('clears search results when navigating away from add-channel', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'Existing Channel', order: 0 }),
      },
      search: [
        createChannel({ id: 'channel-2', title: 'Some Search Result' }),
      ],
      videos: [],
    })

    await page.goto('/add-channel')

    const searchInput = page.locator('input[placeholder="Search Channels"]')
    await searchInput.fill('Some')
    await page.locator('.add-channel form button').click()

    await expect(page.getByText('Some Search Result')).toBeVisible({ timeout: 10000 })

    // Navigate away, unmounting the component and clearing search results
    await page.getByRole('link', { name: /Custom Playlist/ }).click()
    await expect(page).toHaveURL('/add-custom-playlist')

    // Going back to add-channel (client-side, without a full reload) should
    // not show the stale search results
    await page.locator('.add-sub-buttons-links a[href="/add-channel"]').click()
    await expect(page.locator('.add-channel')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Some Search Result')).not.toBeVisible()
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

  test('can filter icons and see an empty message when none match', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'Channel', order: 0 }),
      },
      videos: [],
    })

    await page.goto('/add-custom-playlist')
    await expect(page.locator('.add-custom-playlist')).toBeVisible({ timeout: 10000 })

    await page.locator('.pick-icon').click()
    await expect(page.locator('.icon-picker-modal')).toBeVisible()

    const filterInput = page.locator('.icon-picker fieldset', { hasText: 'Filter' }).locator('input')

    // Filter down to matching icons
    await filterInput.fill('adjust')
    await expect(page.locator('.icon-picker .picker-icon')).toHaveCount(1)

    // Filter to something that matches nothing
    await filterInput.fill('not-a-real-icon-name')
    await expect(page.locator('.icon-picker .empty-icons')).toBeVisible()
    await expect(page.getByText("No icons matching filter 'not-a-real-icon-name'")).toBeVisible()

    // Submitting the form should be prevented and not navigate away
    await page.locator('.icon-picker form').evaluate((form) => form.requestSubmit())
    await expect(page.locator('.icon-picker-modal')).toBeVisible()
  })

  test('can change the foreground and background colors', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'Channel', order: 0 }),
      },
      videos: [],
    })

    await page.goto('/add-custom-playlist')
    await expect(page.locator('.add-custom-playlist')).toBeVisible({ timeout: 10000 })

    await page.locator('.pick-icon').click()
    await expect(page.locator('.icon-picker-modal')).toBeVisible()

    const fgFieldset = page.locator('.icon-picker fieldset', { hasText: 'Foreground Color' })
    const bgFieldset = page.locator('.icon-picker fieldset', { hasText: 'Background Color' })

    // Text input (non-debounced) updates
    await fgFieldset.locator('input:not([type="color"])').fill('#123456')
    await expect(fgFieldset.locator('input[type="color"]')).toHaveValue('#123456')

    await bgFieldset.locator('input:not([type="color"])').fill('#654321')
    await expect(bgFieldset.locator('input[type="color"]')).toHaveValue('#654321')

    // Color input (debounced) updates
    await fgFieldset.locator('input[type="color"]').fill('#abcdef')
    await expect(fgFieldset.locator('input:not([type="color"])')).toHaveValue('#abcdef', { timeout: 2000 })
  })
})

describe('Editing a Custom Playlist Sub Item', () => {
  test('renders a custom playlist in the subs list', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'custom-0': createCustomPlaylist({ id: 'custom-0', title: 'My Favorites', order: 0 }),
      },
      videos: [],
    })

    await page.goto('/')
    await expect(page.locator('.subs-list')).toBeVisible({ timeout: 10000 })

    // The custom playlist renders with its icon and title
    const customItem = page.locator('.custom-sub-item')
    await expect(customItem).toBeVisible()
    await expect(customItem.getByRole('heading', { name: 'My Favorites' })).toBeVisible()
  })

  test('can rename a custom playlist and update its icon while editing', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'custom-0': createCustomPlaylist({ id: 'custom-0', title: 'My Favorites', order: 0 }),
      },
      videos: [],
    })

    await page.goto('/')
    await expect(page.locator('.subs-list')).toBeVisible({ timeout: 10000 })

    const customItem = page.locator('.custom-sub-item')
    await expect(customItem).toBeVisible()

    // Enter edit mode to reveal the title input and editable icon button
    await page.getByRole('button', { name: 'Edit' }).click()

    // Rename the playlist via the title input
    const titleInput = customItem.locator('input')
    await expect(titleInput).toBeVisible()
    await titleInput.fill('Renamed Playlist')
    await expect(titleInput).toHaveValue('Renamed Playlist')

    // Open the icon picker modal from the editable icon button
    await customItem.locator('.sub-item-icon.editable').click()
    await expect(page.locator('.icon-picker-modal')).toBeVisible()

    // Pick a different icon, which updates the sub's icon
    await page.locator('.icon-picker .picker-icon').first().click()

    // Close the modal
    await page.locator('.modal-close').click()
    await expect(page.locator('.icon-picker-modal')).not.toBeVisible()
  })
})

describe('Adding a Second Custom Playlist', () => {
  test('derives a new id from an existing custom playlist', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'custom-0': createCustomPlaylist({ id: 'custom-0', title: 'Existing Playlist', order: 0 }),
      },
      videos: [],
    })

    await page.goto('/add-custom-playlist')
    await expect(page.locator('.add-custom-playlist')).toBeVisible({ timeout: 10000 })

    await page.locator('.add-custom-playlist input').fill('Second Playlist')
    await page.locator('.add-custom-playlist button.submit').click()

    // The new custom playlist's id is derived from the existing one
    await expect(page).toHaveURL('/subs/custom-1')
  })
})

describe('Remote Subs Changes', () => {
  test('removes a sub when it is dropped from a remote update', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'First Channel', order: 0 }),
        'channel-2': createChannel({ id: 'channel-2', title: 'Second Channel', order: 1 }),
      },
      videos: [],
    })

    await page.goto('/')
    await expect(page.locator('.subs-list')).toBeVisible({ timeout: 10000 })

    const subItems = page.locator('.sub-item:not(.all-subs)')
    await expect(subItems).toHaveCount(2)

    // Simulate another client removing "Second Channel" from the shared doc
    await page.evaluate(() => {
      window.__triggerSnapshotUpdate({
        youtubeApiKey: 'fake-api-key',
        watchedVideos: {},
        subs: {
          'channel-1': {
            id: 'channel-1',
            title: 'First Channel',
            playlistId: 'UU123',
            type: 'channel',
            order: 0,
          },
        },
      })
    })

    await expect(subItems).toHaveCount(1)
    await expect(subItems.first()).toContainText('First Channel')
  })
})

describe('Reordering Subs', () => {
  test('does not resave the order when a sub is dropped back in place', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'First Channel', order: 0 }),
        'channel-2': createChannel({ id: 'channel-2', title: 'Second Channel', order: 1 }),
      },
      videos: [],
    })

    await page.goto('/')
    await expect(page.locator('.subs-list')).toBeVisible({ timeout: 10000 })

    const subItems = page.locator('.sub-item:not(.all-subs)')
    await expect(subItems).toHaveCount(2)
    await expect(subItems.nth(0)).toContainText('First Channel')

    const firstHandleBox = await subItems.nth(0).locator('span.sub-item-icon').boundingBox()

    await page.mouse.move(
      firstHandleBox.x + firstHandleBox.width / 2,
      firstHandleBox.y + firstHandleBox.height / 2
    )
    await page.mouse.down()
    // A tiny move that isn't enough to cross into the next item's position
    await page.mouse.move(firstHandleBox.x + firstHandleBox.width / 2, firstHandleBox.y + 2)
    await page.mouse.up()

    // Order should be unchanged since the drop landed at the same index
    await expect(subItems.nth(0)).toContainText('First Channel')
    await expect(subItems.nth(1)).toContainText('Second Channel')
  })

  test('dragging a sub by its handle reorders the subs list', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'First Channel', order: 0 }),
        'channel-2': createChannel({ id: 'channel-2', title: 'Second Channel', order: 1 }),
      },
      videos: [],
    })

    await page.goto('/')
    await expect(page.locator('.subs-list')).toBeVisible({ timeout: 10000 })

    const subItems = page.locator('.sub-item:not(.all-subs)')
    await expect(subItems).toHaveCount(2)
    await expect(subItems.nth(0)).toContainText('First Channel')

    const firstHandleBox = await subItems.nth(0).locator('span.sub-item-icon').boundingBox()
    const secondItemBox = await subItems.nth(1).boundingBox()

    await page.mouse.move(
      firstHandleBox.x + firstHandleBox.width / 2,
      firstHandleBox.y + firstHandleBox.height / 2
    )
    await page.mouse.down()

    // Move in small steps to give dnd-kit a chance to track the drag
    const steps = 10
    for (let i = 1; i <= steps; i++) {
      const y = firstHandleBox.y + ((secondItemBox.y + secondItemBox.height - firstHandleBox.y) * i) / steps
      await page.mouse.move(firstHandleBox.x + firstHandleBox.width / 2, y)
    }

    await page.mouse.up()

    // The subs should now be swapped
    await expect(subItems.nth(0)).toContainText('Second Channel')
    await expect(subItems.nth(1)).toContainText('First Channel')
  })
})
