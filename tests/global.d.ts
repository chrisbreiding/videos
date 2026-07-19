// Specs load app modules from inside the browser via dynamic imports of
// absolute dev-server URLs (e.g. `await import('/src/lib/firebase.ts')`),
// which isn't a module specifier tsc can resolve from Node. Silence that
// without giving up type-checking on the rest of each file.
declare module '/src/*'

// Extra `window` properties used only by test stubs and fakes injected via
// `page.addInitScript`/`page.evaluate`. Kept separate from `src/vite-env.d.ts`
// since the app itself never reads or writes these.
interface Window {
  __coverage__?: unknown
  __ytPlayers?: FakeYtPlayer[]
  __triggerSnapshotUpdate?: (data: unknown) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  __setCalls?: any[]
  __deleteFieldCalls?: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  __deleteFieldUpdates?: any[]
}

interface FakeYtPlayer {
  elementId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any
  state: number | null
  currentTime: number
  calls: {
    stopVideo: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loadVideoById: any[]
    setSize: [number, number][]
    destroy: number
  }
  getCurrentTime: () => number
  getPlayerState: () => number | null
  stopVideo: () => void
  loadVideoById: (opts: unknown) => void
  setSize: (width: number, height: number) => void
  destroy: () => void
  simulateReady: () => void
  simulateStateChange: (state: number) => void
}
