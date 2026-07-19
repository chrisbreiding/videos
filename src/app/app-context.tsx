import debounce from 'lodash.debounce'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import type { Location } from 'react-router'

import { getItem, setItem } from '../lib/local-data'
import { deleteField, update } from '../lib/remote-data'
import type { WatchedVideo, WatchedVideos } from '../lib/types'

export const minNowPlayingHeight = 100
const maxNowPlayingHeightOffset = 10
const nowPlayingSizeRatio = 1080 / 1920

// Debounced writers live at module scope, rather than inside the provider, so
// a single stable instance persists across renders without needing a ref.
const saveVideoProgressDebounced = debounce(
  (videoId: string, entry: WatchedVideo) => {
    update({ watchedVideos: { [videoId]: entry } })
  },
  5000,
  { maxWait: 5000 },
)

const saveNowPlayingHeightDebounced = debounce((height: number) => {
  setItem('nowPlayingHeight', height)
}, 500)

const saveAutoPlayDebounced = debounce((isEnabled: boolean) => {
  setItem('autoPlayEnabled', isEnabled)
}, 500)

interface AppContextValue {
  autoPlayEnabled: boolean
  isSorting: boolean
  windowHeight: number
  maxNowPlayingHeight: number
  nowPlayingHeight: number
  nowPlayingWidth: number
  allSubsMarkedVideoId?: string
  watchedVideos: WatchedVideos
  savedLocation?: Location
  setSorting: (isSorting: boolean) => void
  setAllSubsMarkedVideoId: (allSubsMarkedVideoId?: string, save?: boolean) => void
  setWatchedVideos: (watchedVideos: WatchedVideos) => void
  saveVideoProgress: (
    videoId: string,
    watchTimestamp: number,
    immediate?: boolean,
  ) => void
  updateNowPlayingHeight: (height: number) => void
  toggleAutoPlay: () => void
  setSavedLocation: (location?: Location) => void
}

export const AppContext = createContext<AppContextValue | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(
    () => getItem<boolean>('autoPlayEnabled') ?? true,
  )
  const [isSorting, setIsSorting] = useState(false)
  const [windowHeight, setWindowHeight] = useState(window.innerHeight)
  const [nowPlayingHeightRaw, setNowPlayingHeightRaw] = useState(
    () => getItem<number>('nowPlayingHeight') ?? 540,
  )
  const [allSubsMarkedVideoId, setAllSubsMarkedVideoIdState] = useState<
    string | undefined
  >(undefined)
  const [watchedVideos, setWatchedVideosState] = useState<WatchedVideos>({})
  const [savedLocation, setSavedLocation] = useState<Location | undefined>(
    undefined,
  )

  useEffect(() => {
    const onWindowResize = () => setWindowHeight(window.innerHeight)

    window.addEventListener('resize', onWindowResize)

    // AppProvider lives for the whole app session, so this cleanup only runs
    // on full page unload, which the browser already handles on its own.
    /* istanbul ignore next */
    return () => window.removeEventListener('resize', onWindowResize)
  }, [])

  const maxNowPlayingHeight = windowHeight - maxNowPlayingHeightOffset

  let nowPlayingHeight = nowPlayingHeightRaw
  if (nowPlayingHeight > maxNowPlayingHeight) {
    nowPlayingHeight = maxNowPlayingHeight
  }
  if (nowPlayingHeight < minNowPlayingHeight) {
    nowPlayingHeight = minNowPlayingHeight
  }

  const nowPlayingWidth = Math.floor(nowPlayingHeight / nowPlayingSizeRatio)

  const setSorting = (isSorting: boolean) => {
    setIsSorting(isSorting)
  }

  const setAllSubsMarkedVideoId = (
    allSubsMarkedVideoId?: string,
    save = true,
  ) => {
    setAllSubsMarkedVideoIdState(allSubsMarkedVideoId)

    if (save) {
      if (allSubsMarkedVideoId == null) {
        deleteField('allSubsMarkedVideoId')
      } else {
        update({ allSubsMarkedVideoId })
      }
    }
  }

  const setWatchedVideos = (watchedVideos: WatchedVideos) => {
    setWatchedVideosState(watchedVideos)
  }

  const saveVideoProgress = (
    videoId: string,
    watchTimestamp: number,
    immediate?: boolean,
  ) => {
    const entry: WatchedVideo = {
      watchTimestamp,
      updatedAt: new Date().toISOString(),
    }

    setWatchedVideosState((watchedVideos) => ({
      ...watchedVideos,
      [videoId]: entry,
    }))

    if (immediate) {
      saveVideoProgressDebounced.cancel()
      update({ watchedVideos: { [videoId]: entry } })
    } else {
      saveVideoProgressDebounced(videoId, entry)
    }
  }

  const updateNowPlayingHeight = (height: number) => {
    saveNowPlayingHeightDebounced(height)
    setNowPlayingHeightRaw(height)
  }

  const toggleAutoPlay = () => {
    const nextAutoPlayEnabled = !autoPlayEnabled

    setAutoPlayEnabled(nextAutoPlayEnabled)
    saveAutoPlayDebounced(nextAutoPlayEnabled)
  }

  const value: AppContextValue = {
    autoPlayEnabled,
    isSorting,
    windowHeight,
    maxNowPlayingHeight,
    nowPlayingHeight,
    nowPlayingWidth,
    allSubsMarkedVideoId,
    watchedVideos,
    savedLocation,
    setSorting,
    setAllSubsMarkedVideoId,
    setWatchedVideos,
    saveVideoProgress,
    updateNowPlayingHeight,
    toggleAutoPlay,
    setSavedLocation,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => useContext(AppContext)!
