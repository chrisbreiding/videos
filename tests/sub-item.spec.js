import { test, expect } from './util/coverage-fixture'
import { setupApp, createChannel, createPlaylist } from './util/helpers'

const { describe } = test

describe('Sub Item - Bookmark Link', () => {
  test('navigates to the bookmarked page when the bookmark is clicked', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'Bookmarked Channel',
          playlistId: 'UU123',
          bookmarkedPageToken: 'BOOKMARK_TOKEN',
          order: 0,
        }),
      },
      videos: [],
    })

    await page.goto('/')
    await expect(page.locator('.subs-list')).toBeVisible({ timeout: 10000 })

    // The bookmark link renders because the sub has a bookmarkedPageToken
    const bookmark = page.locator('.sub-bookmark')
    await expect(bookmark).toBeVisible()

    // Clicking it navigates to the bookmarked page (and stops propagation so the
    // surrounding sub-title link does not also fire)
    await bookmark.click()
    await expect(page).toHaveURL(/\/subs\/channel-1\/page\/BOOKMARK_TOKEN/)
  })

  test('does not render a bookmark when the sub has no bookmarked page', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'Plain Channel', order: 0 }),
      },
      videos: [],
    })

    await page.goto('/')
    await expect(page.locator('.subs-list')).toBeVisible({ timeout: 10000 })

    await expect(page.locator('.sub-bookmark')).toHaveCount(0)
  })
})

describe('Sub Item - Editing a Channel', () => {
  test('renames a channel via the title input', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'Old Name', order: 0 }),
      },
      videos: [],
    })

    await page.goto('/')
    await expect(page.locator('.subs-list')).toBeVisible({ timeout: 10000 })

    // Enter edit mode to reveal the title input
    await page.getByRole('button', { name: 'Edit' }).click()

    const titleInput = page.locator('.channel-sub-item input')
    await expect(titleInput).toBeVisible()
    await expect(titleInput).toHaveValue('Old Name')

    // Typing fires onChange -> onUpdate({ title }), and the controlled input
    // reflects the updated sub title
    await titleInput.fill('New Name')
    await expect(titleInput).toHaveValue('New Name')
  })

  test('updates a channel thumbnail from the channel details', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'Channel',
          thumb: 'https://example.com/old-thumb.jpg',
          order: 0,
        }),
      },
      videos: [],
      channels: [{
        id: 'channel-1',
        contentDetails: { relatedPlaylists: { uploads: 'UU123' } },
        snippet: { thumbnails: { medium: { url: 'https://example.com/new-channel-thumb.jpg' } } },
      }],
    })

    await page.goto('/')
    await expect(page.locator('.subs-list')).toBeVisible({ timeout: 10000 })

    await page.getByRole('button', { name: 'Edit' }).click()

    const thumbButton = page.locator('.channel-sub-item .sub-item-icon.editable')
    await expect(thumbButton).toBeVisible()
    await expect(thumbButton.locator('img')).toHaveAttribute('src', 'https://example.com/old-thumb.jpg')

    // Clicking the editable thumb fetches channel details and updates the thumb
    await thumbButton.click()
    await expect(thumbButton.locator('img')).toHaveAttribute('src', 'https://example.com/new-channel-thumb.jpg')
  })

  test('updates a playlist thumbnail from the playlist details', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'playlist-1': createPlaylist({
          id: 'playlist-1',
          title: 'My Playlist',
          playlistId: 'PL123',
          thumb: 'https://example.com/old-playlist-thumb.jpg',
          order: 0,
        }),
      },
      videos: [],
      playlists: [{
        id: 'PL123',
        title: 'My Playlist',
        thumb: 'https://example.com/new-playlist-thumb.jpg',
        count: 5,
      }],
    })

    await page.goto('/')
    await expect(page.locator('.subs-list')).toBeVisible({ timeout: 10000 })

    await page.getByRole('button', { name: 'Edit' }).click()

    const thumbButton = page.locator('.playlist-sub-item .sub-item-icon.editable')
    await expect(thumbButton).toBeVisible()

    // Clicking the editable thumb takes the playlist branch (getPlaylistDetails)
    await thumbButton.click()
    await expect(thumbButton.locator('img')).toHaveAttribute('src', 'https://example.com/new-playlist-thumb.jpg')
  })

  test('logs an error and keeps the old thumbnail when the details lookup fails', async ({ page }) => {
    // No `channels` override, so the default /channels response has no snippet
    // and getChannelDetails throws, exercising the catch branch.
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'Channel',
          thumb: 'https://example.com/old-thumb.jpg',
          order: 0,
        }),
      },
      videos: [],
    })

    const consoleErrors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    await page.goto('/')
    await expect(page.locator('.subs-list')).toBeVisible({ timeout: 10000 })

    await page.getByRole('button', { name: 'Edit' }).click()

    const thumbButton = page.locator('.channel-sub-item .sub-item-icon.editable')
    await expect(thumbButton).toBeVisible()

    await thumbButton.click()

    // The failure is caught and logged, and the thumbnail is left unchanged
    await expect.poll(() => consoleErrors.some((t) => t.includes('Failed to update thumbnail'))).toBe(true)
    await expect(thumbButton.locator('img')).toHaveAttribute('src', 'https://example.com/old-thumb.jpg')
  })
})

describe('Sub Item - Removing a Sub', () => {
  test('removes the sub when the removal is confirmed', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'Doomed Channel', order: 0 }),
      },
      videos: [],
    })

    await page.goto('/')
    await expect(page.locator('.subs-list')).toBeVisible({ timeout: 10000 })

    await page.getByRole('button', { name: 'Edit' }).click()

    await expect(page.locator('.channel-sub-item')).toBeVisible()

    // Accept the confirm() dialog so onRemove runs
    page.once('dialog', (dialog) => {
      expect(dialog.message()).toContain('Doomed Channel')
      dialog.accept()
    })

    await page.locator('.sub-item', { has: page.locator('.channel-sub-item') }).locator('.remove').click()

    await expect(page.locator('.channel-sub-item')).toHaveCount(0)
  })

  test('keeps the sub when the removal is dismissed', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({ id: 'channel-1', title: 'Kept Channel', order: 0 }),
      },
      videos: [],
    })

    await page.goto('/')
    await expect(page.locator('.subs-list')).toBeVisible({ timeout: 10000 })

    await page.getByRole('button', { name: 'Edit' }).click()

    await expect(page.locator('.channel-sub-item')).toBeVisible()

    // Dismiss the confirm() dialog so onRemove is not called
    page.once('dialog', (dialog) => dialog.dismiss())

    await page.locator('.sub-item', { has: page.locator('.channel-sub-item') }).locator('.remove').click()

    // The sub is still present
    await expect(page.locator('.channel-sub-item')).toBeVisible()
  })
})
