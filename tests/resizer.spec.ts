import type { Page } from '@playwright/test'
import { test, expect } from './util/coverage-fixture'
import {
  setupApp,
  createChannel,
  createVideo,
  mockYoutubeIframeApi,
} from './util/helpers'

const { describe } = test

describe('Resizer', () => {
  async function setup(page: Page, { viewportHeight = 800 } = {}) {
    await page.setViewportSize({ width: 1280, height: viewportHeight })

    await mockYoutubeIframeApi(page)
    await setupApp(page, {
      subs: {
        'channel-1': createChannel({
          id: 'channel-1',
          title: 'My Channel',
          playlistId: 'UU123',
          order: 0,
        }),
      },
      videos: [createVideo({ id: 'resize-1', title: 'Resizable Video' })],
    })

    await page.goto('/subs/channel-1?nowPlaying=resize-1')
    await expect(page.locator('.now-playing')).toBeVisible({ timeout: 10000 })
  }

  async function nowPlayingHeight(page: Page) {
    return page
    .locator('.now-playing')
    .evaluate((el) => parseInt((el as HTMLElement).style.height, 10))
  }

  test('resizes within the allowed range while dragging', async ({ page }) => {
    await setup(page, { viewportHeight: 800 })

    const resizer = page.locator('.resizer')
    const box = (await resizer.boundingBox())!

    await page.mouse.move(box.x + box.width / 2, box.y)
    await page.mouse.down()
    await expect(page.locator('.app')).toHaveClass(/is-resizing/)

    await page.mouse.move(box.x + box.width / 2, 400)
    await expect.poll(() => nowPlayingHeight(page)).toBe(400)

    await page.mouse.up()
    await expect(page.locator('.app')).not.toHaveClass(/is-resizing/)
  })

  test('clamps to minHeight when dragged above the top of the allowed range', async ({
    page,
  }) => {
    await setup(page, { viewportHeight: 800 })

    const resizer = page.locator('.resizer')
    const box = (await resizer.boundingBox())!

    await page.mouse.move(box.x + box.width / 2, box.y)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2, 5)

    // minHeight is 100
    await expect.poll(() => nowPlayingHeight(page)).toBe(100)

    await page.mouse.up()
  })

  test('clamps to maxHeight when dragged below the bottom of the allowed range', async ({
    page,
  }) => {
    await setup(page, { viewportHeight: 800 })

    const resizer = page.locator('.resizer')
    const box = (await resizer.boundingBox())!

    await page.mouse.move(box.x + box.width / 2, box.y)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2, 795)

    // maxHeight is windowHeight - 10
    await expect.poll(() => nowPlayingHeight(page)).toBe(790)

    await page.mouse.up()
  })

  test('ignores mouse movement and mouseup when not dragging', async ({
    page,
  }) => {
    await setup(page, { viewportHeight: 800 })

    const heightBefore = await nowPlayingHeight(page)

    const resizer = page.locator('.resizer')
    const box = (await resizer.boundingBox())!

    // move and release the mouse without ever pressing down on the resizer
    await page.mouse.move(box.x + box.width / 2, 400)
    await expect(page.locator('.app')).not.toHaveClass(/is-resizing/)
    expect(await nowPlayingHeight(page)).toBe(heightBefore)

    await page.mouse.up()
    await expect(page.locator('.app')).not.toHaveClass(/is-resizing/)
    expect(await nowPlayingHeight(page)).toBe(heightBefore)
  })

  test('removes its document listeners when unmounted', async ({ page }) => {
    await setup(page, { viewportHeight: 800 })

    await expect(page.locator('.resizer')).toBeVisible()

    // closing now-playing unmounts the Resizer, running its effect cleanup
    await page.locator('.now-playing .close').click()
    await expect(page.locator('.resizer')).toHaveCount(0)

    // dragging where the resizer used to be no longer affects anything
    const resizerBox = await page.evaluate(() => ({
      x: window.innerWidth / 2,
      y: 400,
    }))
    await page.mouse.move(resizerBox.x, resizerBox.y)
    await page.mouse.down()
    await page.mouse.move(resizerBox.x, 500)
    await page.mouse.up()

    await expect(page.locator('.now-playing')).toHaveCount(0)
  })
})
