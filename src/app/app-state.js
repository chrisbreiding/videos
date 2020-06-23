import _ from 'lodash'
import { action, computed, observable } from 'mobx'

import { getItem, setItem } from '../lib/local-data'
import { update } from '../lib/remote-data'

const minNowPlayingHeight = 100
const maxNowPlayingHeightOffset = 10
const nowPlayingSizeRatio = 1080 / 1920

class AppState {
  @observable _nowPlayingHeight = 540
  @observable autoPlayEnabled = true
  @observable isSorting = false
  @observable windowHeight = window.innerHeight
  @observable allSubsMarkedVideoId

  constructor () {
    window.addEventListener('resize', this._onWindowResize)

    this._setProp('autoPlayEnabled', getItem('autoPlayEnabled'))
    this._setProp('_nowPlayingHeight', getItem('nowPlayingHeight'))
  }

  @computed get _maxNowPlayingHeight () {
    return this.windowHeight - maxNowPlayingHeightOffset
  }

  @computed get nowPlayingHeight () {
    let height = this._nowPlayingHeight
    if (height > this._maxNowPlayingHeight) height = this._maxNowPlayingHeight
    if (height < minNowPlayingHeight) height = minNowPlayingHeight

    return height
  }

  @computed get nowPlayingWidth () {
    return Math.floor(this.nowPlayingHeight / nowPlayingSizeRatio)
  }

  @action _setProp (key, value) {
    if (value == null) return

    this[key] = value
  }

  @action setSorting (isSorting) {
    this.isSorting = isSorting
  }

  @action setAllSubsMarkedVideoId (allSubsMarkedVideoId, save = true) {
    this.allSubsMarkedVideoId = allSubsMarkedVideoId

    if (save) this.save()
  }

  @action _onWindowResize = () => {
    this.windowHeight = window.innerHeight
  }

  @action updateNowPlayingHeight (height) {
    this._saveNowPlayingHeight(height)
    this._nowPlayingHeight = height
  }

  _saveNowPlayingHeight = _.debounce((height) => {
    setItem('nowPlayingHeight', height)
  }, 500)

  @action toggleAutoPlay = () => {
    this.autoPlayEnabled = !this.autoPlayEnabled
    this._saveAutoPlay(this.autoPlayEnabled)
  }

  _saveAutoPlay = _.debounce((isEnabled) => {
    setItem('autoPlayEnabled', isEnabled)
  }, 500)

  save () {
    update({ allSubsMarkedVideoId: this.allSubsMarkedVideoId })
  }
}

export default new AppState()
