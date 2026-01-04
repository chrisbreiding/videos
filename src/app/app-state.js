import _ from 'lodash'
import { action, computed, makeObservable, observable } from 'mobx'

import { getItem, setItem } from '../lib/local-data'
import { update } from '../lib/remote-data'

const minNowPlayingHeight = 100
const maxNowPlayingHeightOffset = 10
const nowPlayingSizeRatio = 1080 / 1920

class AppState {
  _nowPlayingHeight = 540
  autoPlayEnabled = true
  isSorting = false
  windowHeight = window.innerHeight
  allSubsMarkedVideoId

  constructor () {
    makeObservable(this, {
      _nowPlayingHeight: observable,
      autoPlayEnabled: observable,
      isSorting: observable,
      windowHeight: observable,
      allSubsMarkedVideoId: observable,
      _maxNowPlayingHeight: computed,
      nowPlayingHeight: computed,
      nowPlayingWidth: computed,
      _setProp: action,
      setSorting: action,
      setAllSubsMarkedVideoId: action,
      _onWindowResize: action,
      updateNowPlayingHeight: action,
      toggleAutoPlay: action,
    })

    window.addEventListener('resize', this._onWindowResize)

    this._setProp('autoPlayEnabled', getItem('autoPlayEnabled'))
    this._setProp('_nowPlayingHeight', getItem('nowPlayingHeight'))
  }

  get _maxNowPlayingHeight () {
    return this.windowHeight - maxNowPlayingHeightOffset
  }

  get nowPlayingHeight () {
    let height = this._nowPlayingHeight
    if (height > this._maxNowPlayingHeight) height = this._maxNowPlayingHeight
    if (height < minNowPlayingHeight) height = minNowPlayingHeight

    return height
  }

  get nowPlayingWidth () {
    return Math.floor(this.nowPlayingHeight / nowPlayingSizeRatio)
  }

  _setProp (key, value) {
    if (value == null) return

    this[key] = value
  }

  setSorting (isSorting) {
    this.isSorting = isSorting
  }

  setAllSubsMarkedVideoId (allSubsMarkedVideoId, save = true) {
    this.allSubsMarkedVideoId = allSubsMarkedVideoId

    if (save) this.save()
  }

  _onWindowResize = () => {
    this.windowHeight = window.innerHeight
  }

  updateNowPlayingHeight (height) {
    this._saveNowPlayingHeight(height)
    this._nowPlayingHeight = height
  }

  _saveNowPlayingHeight = _.debounce((height) => {
    setItem('nowPlayingHeight', height)
  }, 500)

  toggleAutoPlay = () => {
    this.autoPlayEnabled = !this.autoPlayEnabled
    this._saveAutoPlay(this.autoPlayEnabled)
  }

  _saveAutoPlay = _.debounce((isEnabled) => {
    setItem('autoPlayEnabled', isEnabled)
  }, 500)

  setSavedLocation (location) {
    this.savedLocation = location
  }

  save () {
    update({ allSubsMarkedVideoId: this.allSubsMarkedVideoId })
  }
}

export const appState = new AppState()
