import debounce from 'lodash.debounce'
import type { Location } from 'react-router'

import { Store } from '../lib/store'
import { getItem, setItem } from '../lib/local-data'
import { deleteField, update } from '../lib/remote-data'
import type { WatchedVideo, WatchedVideos } from '../lib/types'

export const minNowPlayingHeight = 100
const maxNowPlayingHeightOffset = 10
const nowPlayingSizeRatio = 1080 / 1920

class AppState extends Store {
  _nowPlayingHeight = 540
  autoPlayEnabled = true
  isSorting = false
  windowHeight = window.innerHeight
  allSubsMarkedVideoId?: string
  watchedVideos: WatchedVideos = {}
  savedLocation?: Location

  constructor() {
    super()

    window.addEventListener('resize', this._onWindowResize)

    this._setProp('autoPlayEnabled', getItem('autoPlayEnabled'))
    this._setProp('_nowPlayingHeight', getItem('nowPlayingHeight'))
  }

  get maxNowPlayingHeight() {
    return this.windowHeight - maxNowPlayingHeightOffset
  }

  get nowPlayingHeight() {
    let height = this._nowPlayingHeight
    if (height > this.maxNowPlayingHeight) height = this.maxNowPlayingHeight
    if (height < minNowPlayingHeight) height = minNowPlayingHeight

    return height
  }

  get nowPlayingWidth() {
    return Math.floor(this.nowPlayingHeight / nowPlayingSizeRatio)
  }

  _setProp<K extends keyof AppState>(
    key: K,
    value: AppState[K] | null | undefined,
  ) {
    if (value == null) return

    ;(this as Record<K, AppState[K]>)[key] = value
  }

  setSorting(isSorting: boolean) {
    this.isSorting = isSorting
    this.emit()
  }

  setAllSubsMarkedVideoId(allSubsMarkedVideoId?: string, save = true) {
    this.allSubsMarkedVideoId = allSubsMarkedVideoId

    if (save) this.save()
    this.emit()
  }

  setWatchedVideos(watchedVideos?: WatchedVideos) {
    this.watchedVideos = watchedVideos || {}
    this.emit()
  }

  saveVideoProgress(
    videoId: string,
    watchTimestamp: number,
    immediate?: boolean,
  ) {
    this._updateVideoProgress(videoId, watchTimestamp, immediate)
  }

  _updateVideoProgress(
    videoId: string | undefined,
    watchTimestamp: number,
    immediate?: boolean,
  ) {
    if (!videoId) return

    const entry: WatchedVideo = {
      watchTimestamp,
      updatedAt: new Date().toISOString(),
    }

    this.watchedVideos[videoId] = entry
    this.emit()

    if (immediate) {
      this._saveVideoProgressDebounced.cancel()
      this._saveVideoProgress(videoId, entry)
    } else {
      this._saveVideoProgressDebounced(videoId, entry)
    }
  }

  _saveVideoProgress = (videoId: string, entry: WatchedVideo) => {
    update({ watchedVideos: { [videoId]: entry } })
  }

  _saveVideoProgressDebounced = debounce(
    (videoId: string, entry: WatchedVideo) => {
      update({ watchedVideos: { [videoId]: entry } })
    },
    5000,
    { maxWait: 5000 },
  )

  _onWindowResize = () => {
    this.windowHeight = window.innerHeight
    this.emit()
  }

  updateNowPlayingHeight(height: number) {
    this._saveNowPlayingHeight(height)
    this._nowPlayingHeight = height
    this.emit()
  }

  _saveNowPlayingHeight = debounce((height: number) => {
    setItem('nowPlayingHeight', height)
  }, 500)

  toggleAutoPlay = () => {
    this.autoPlayEnabled = !this.autoPlayEnabled
    this._saveAutoPlay(this.autoPlayEnabled)
    this.emit()
  }

  _saveAutoPlay = debounce((isEnabled: boolean) => {
    setItem('autoPlayEnabled', isEnabled)
  }, 500)

  setSavedLocation(location?: Location) {
    this.savedLocation = location
    this.emit()
  }

  save() {
    if (this.allSubsMarkedVideoId == null) {
      deleteField('allSubsMarkedVideoId')
    } else {
      update({ allSubsMarkedVideoId: this.allSubsMarkedVideoId })
    }
  }
}

export const appState = new AppState()
