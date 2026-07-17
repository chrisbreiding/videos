import type { Page } from '@playwright/test'
import { test, expect } from './util/coverage-fixture'
import { stubFirebaseAuth } from './util/helpers'

const { describe } = test

interface SaveVideoProgressArgs {
  videoId?: string
  watchTimestamp: number
  immediate: boolean
}

// Reaches the live appState singleton the running app already instantiated.
// The Playwright webServer runs the Vite dev server, which serves source
// modules by path, so importing the module URL returns the same cached
// instance (and runs the instrumented code so it counts toward coverage).
async function callSaveVideoProgress (page: Page, { videoId, watchTimestamp, immediate }: SaveVideoProgressArgs) {
  return page.evaluate(async (args) => {
    const { appState } = await import('/src/app/app-state.ts')

    window.__setCalls!.length = 0
    appState.saveVideoProgress(args.videoId, args.watchTimestamp, args.immediate)

    return {
      watched: appState.watchedVideos[args.videoId!],
      setCalls: window.__setCalls,
    }
  }, { videoId, watchTimestamp, immediate })
}

async function setup (page: Page) {
  await stubFirebaseAuth(page)

  // Record every firestore `set` payload so we can assert whether a save was
  // flushed immediately or deferred to the debounced writer.
  await page.addInitScript(() => {
    window.__setCalls = []
    const originalUserDoc = window.__firebaseStubs!.userDoc!
    window.__firebaseStubs!.userDoc = () => {
      const doc = originalUserDoc()
      const originalSet = doc.set
      doc.set = (data: unknown, options: unknown) => {
        window.__setCalls!.push(data)
        return originalSet(data, options)
      }
      return doc
    }
  })

  await page.goto('/')
  await expect(page.locator('.subs')).toBeVisible({ timeout: 10000 })
}

describe('AppState#saveVideoProgress', () => {
  test('records the watch progress for the video in memory', async ({ page }) => {
    await setup(page)

    const { watched } = await callSaveVideoProgress(page, {
      videoId: 'video-abc', watchTimestamp: 42, immediate: true,
    })

    expect(watched.watchTimestamp).toBe(42)
    expect(typeof watched.updatedAt).toBe('string')
  })

  test('flushes the save immediately when immediate is true', async ({ page }) => {
    await setup(page)

    const { setCalls } = await callSaveVideoProgress(page, {
      videoId: 'video-abc', watchTimestamp: 42, immediate: true,
    })

    expect(setCalls).toEqual([
      { watchedVideos: { 'video-abc': { watchTimestamp: 42, updatedAt: expect.any(String) } } },
    ])
  })

  test('debounces the save when immediate is false', async ({ page }) => {
    await setup(page)

    const { watched, setCalls } = await callSaveVideoProgress(page, {
      videoId: 'video-abc', watchTimestamp: 99, immediate: false,
    })

    // progress is tracked in memory right away...
    expect(watched.watchTimestamp).toBe(99)
    // ...but the remote write is debounced, so nothing is flushed yet
    expect(setCalls).toEqual([])
  })

  test('does nothing when no videoId is provided', async ({ page }) => {
    await setup(page)

    const result = await page.evaluate(async () => {
      const { appState } = await import('/src/app/app-state.ts')
      const before = Object.keys(appState.watchedVideos).length

      window.__setCalls!.length = 0
      appState.saveVideoProgress(undefined, 42, true)

      return {
        before,
        after: Object.keys(appState.watchedVideos).length,
        setCalls: window.__setCalls,
      }
    })

    expect(result.after).toBe(result.before)
    expect(result.setCalls).toEqual([])
  })

  test('flushes the debounced save on its own once the wait elapses', async ({ page }) => {
    await setup(page)

    const setCalls = await page.evaluate(async () => {
      const { appState } = await import('/src/app/app-state.ts')

      window.__setCalls!.length = 0
      appState.saveVideoProgress('video-debounced', 7, false)

      return new Promise((resolve) => {
        setTimeout(() => resolve(window.__setCalls), 5100)
      })
    })

    expect(setCalls).toEqual([
      { watchedVideos: { 'video-debounced': { watchTimestamp: 7, updatedAt: expect.any(String) } } },
    ])
  })
})

describe('AppState#setAllSubsMarkedVideoId', () => {
  test('saves remotely by default', async ({ page }) => {
    await setup(page)

    const result = await page.evaluate(async () => {
      const { appState } = await import('/src/app/app-state.ts')

      window.__setCalls!.length = 0
      appState.setAllSubsMarkedVideoId('video-marked')

      return {
        allSubsMarkedVideoId: appState.allSubsMarkedVideoId,
        setCalls: window.__setCalls,
      }
    })

    expect(result.allSubsMarkedVideoId).toBe('video-marked')
    expect(result.setCalls).toEqual([{ allSubsMarkedVideoId: 'video-marked' }])
  })

  test('does not save remotely when save is false', async ({ page }) => {
    await setup(page)

    const result = await page.evaluate(async () => {
      const { appState } = await import('/src/app/app-state.ts')

      window.__setCalls!.length = 0
      appState.setAllSubsMarkedVideoId('video-marked-local', false)

      return {
        allSubsMarkedVideoId: appState.allSubsMarkedVideoId,
        setCalls: window.__setCalls,
      }
    })

    expect(result.allSubsMarkedVideoId).toBe('video-marked-local')
    expect(result.setCalls).toEqual([])
  })

  test('deletes the remote field instead of saving undefined when unmarked', async ({ page }) => {
    await stubFirebaseAuth(page)

    // Firestore's real setDoc()/updateDoc() throw when a field value is
    // undefined, so mimic that here to reproduce the production error
    // instead of silently accepting it like the plain stub does.
    await page.addInitScript(() => {
      window.__setCalls = []
      window.__deleteFieldCalls = []
      const originalUserDoc = window.__firebaseStubs!.userDoc!
      window.__firebaseStubs!.userDoc = () => {
        const doc = originalUserDoc()
        doc.set = (data: Record<string, unknown>) => {
          for (const key in data) {
            if (data[key] === undefined) {
              throw new Error(`FirebaseError: Function setDoc() called with invalid data. Unsupported field value: undefined (found in field ${key})`)
            }
          }
          window.__setCalls!.push(data)
          return Promise.resolve()
        }
        return doc
      }
      window.__firebaseStubs!.deleteField = (fieldPath: string) => {
        window.__deleteFieldCalls!.push(fieldPath)
        return Promise.resolve()
      }
    })

    await page.goto('/')
    await expect(page.locator('.subs')).toBeVisible({ timeout: 10000 })

    const result = await page.evaluate(async () => {
      const { appState } = await import('/src/app/app-state.ts')

      appState.setAllSubsMarkedVideoId('video-marked')
      window.__setCalls!.length = 0
      window.__deleteFieldCalls!.length = 0

      appState.setAllSubsMarkedVideoId(undefined)

      return {
        allSubsMarkedVideoId: appState.allSubsMarkedVideoId,
        setCalls: window.__setCalls,
        deleteFieldCalls: window.__deleteFieldCalls,
      }
    })

    expect(result.allSubsMarkedVideoId).toBeUndefined()
    expect(result.setCalls).toEqual([])
    expect(result.deleteFieldCalls).toEqual(['allSubsMarkedVideoId'])
  })
})

describe('AppState#setWatchedVideos', () => {
  test('uses the given watched videos when present', async ({ page }) => {
    await setup(page)

    const result = await page.evaluate(async () => {
      const { appState } = await import('/src/app/app-state.ts')

      appState.setWatchedVideos({ 'video-1': { watchTimestamp: 1 } })

      return appState.watchedVideos
    })

    expect(result).toEqual({ 'video-1': { watchTimestamp: 1 } })
  })

  test('falls back to an empty object when none are given', async ({ page }) => {
    await setup(page)

    const result = await page.evaluate(async () => {
      const { appState } = await import('/src/app/app-state.ts')

      appState.setWatchedVideos({ 'video-1': { watchTimestamp: 1 } })
      appState.setWatchedVideos(undefined)

      return appState.watchedVideos
    })

    expect(result).toEqual({})
  })
})

describe('AppState#_onWindowResize', () => {
  test('updates windowHeight when the window is resized', async ({ page }) => {
    await setup(page)

    const result = await page.evaluate(async () => {
      const { appState } = await import('/src/app/app-state.ts')

      Object.defineProperty(window, 'innerHeight', { configurable: true, value: 555 })
      window.dispatchEvent(new Event('resize'))

      return appState.windowHeight
    })

    expect(result).toBe(555)
  })
})

describe('AppState#updateNowPlayingHeight', () => {
  test('persists the height to local storage once the debounce elapses', async ({ page }) => {
    await setup(page)

    const height = await page.evaluate(async () => {
      const { appState } = await import('/src/app/app-state.ts')

      appState.updateNowPlayingHeight(321)

      return new Promise((resolve) => {
        setTimeout(() => resolve(JSON.parse(localStorage.nowPlayingHeight)), 600)
      })
    })

    expect(height).toBe(321)
  })
})

describe('AppState#toggleAutoPlay', () => {
  test('persists the toggled value to local storage once the debounce elapses', async ({ page }) => {
    await setup(page)

    const autoPlayEnabled = await page.evaluate(async () => {
      const { appState } = await import('/src/app/app-state.ts')
      const before = appState.autoPlayEnabled

      appState.toggleAutoPlay()

      return new Promise<{ before: boolean, after: boolean, stored: boolean }>((resolve) => {
        setTimeout(() => resolve({ before, after: appState.autoPlayEnabled, stored: JSON.parse(localStorage.autoPlayEnabled) }), 600)
      })
    })

    expect(autoPlayEnabled.after).toBe(!autoPlayEnabled.before)
    expect(autoPlayEnabled.stored).toBe(autoPlayEnabled.after)
  })
})
