import { test, expect } from './util/coverage-fixture'
import { setupApp, createChannel, createVideo, createSearchPlaylist } from './util/helpers'

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
