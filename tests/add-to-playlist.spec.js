import { test, expect } from './util/coverage-fixture'
import { setupApp, createCustomPlaylist, createVideo } from './util/helpers'

const { describe } = test

describe('Add To Playlist', () => {
  test('adds the video to the playlist and redirects to it when the playlist exists', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'custom-0': createCustomPlaylist({ id: 'custom-0', title: 'Watch Later', order: 0 }),
      },
      videos: [
        createVideo({ id: 'video-1', title: 'Added Video' }),
      ],
    })

    await page.goto('/add-to-playlist?playlistId=custom-0&videoId=video-1')

    // Should redirect to the playlist page
    await expect(page).toHaveURL(/\/subs\/custom-0/, { timeout: 10000 })

    // The added video should show up in the playlist
    await expect(page.getByText('Added Video')).toBeVisible({ timeout: 10000 })
  })

  test('shows an error when the playlist does not exist', async ({ page }) => {
    await setupApp(page, {
      subs: {
        'custom-0': createCustomPlaylist({ id: 'custom-0', title: 'Watch Later', order: 0 }),
      },
    })

    await page.goto('/add-to-playlist?playlistId=does-not-exist&videoId=video-1')

    // Stays on the add-to-playlist page and surfaces the error
    await expect(page.locator('.add-to-playlist')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Failed to add video to playlist:')).toBeVisible()
    await expect(page.getByText('Playlist not found')).toBeVisible()
    await expect(page).toHaveURL(/\/add-to-playlist/)
  })
})
