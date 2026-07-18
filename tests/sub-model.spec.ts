import { test, expect } from './util/coverage-fixture'
import { setupApp } from './util/helpers'

const { describe } = test

describe('sub/sub-model', () => {
  test('falls back to the circle icon when the icon name is unrecognized', async ({
    page,
  }) => {
    await setupApp(page)
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()

    const result = await page.evaluate(async () => {
      const { SubModel } = await import('/src/sub/sub-model.ts')

      const withUnknownIcon = new SubModel({
        id: 'custom-1',
        type: 'custom',
        icon: {
          icon: 'not-a-real-icon',
          foregroundColor: '#fff',
          backgroundColor: '#000',
        },
      })

      const withKnownIcon = new SubModel({
        id: 'custom-2',
        type: 'custom',
        icon: {
          icon: 'star',
          foregroundColor: '#fff',
          backgroundColor: '#000',
        },
      })

      return {
        unknownIcon: withUnknownIcon.icon?.icon,
        knownIcon: withKnownIcon.icon?.icon,
      }
    })

    expect(result.unknownIcon).toBe('circle')
    expect(result.knownIcon).toBe('star')
  })
})
