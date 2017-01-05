import _ from 'lodash'
import { action, computed, observable } from 'mobx'
import { NOW_PLAYING_HEIGHT } from '../lib/constants'
import { getItem, setItem } from '../lib/local-data'

const minNowPlayingHeight = 100
const maxNowPlayingHeightOffset = 10
const nowPlayingSizeRatio = 0.5625

class AppState {
  @observable _nowPlayingHeight = 540
  @observable windowHeight = window.innerHeight

  constructor () {
    window.addEventListener('resize', this._onWindowResize)
    getItem(NOW_PLAYING_HEIGHT).then(action('got:stored:now:playing:height', (height) => {
      if (height != null) {
        this._nowPlayingHeight = height
      }
    }))
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

  @action _onWindowResize = () => {
    this.windowHeight = window.innerHeight
  }

  updateNowPlayingHeight (height) {
    this._saveNowPlayingHeight(height)
    this._nowPlayingHeight = height
  }

  _saveNowPlayingHeight = _.debounce((height) => {
    setItem(NOW_PLAYING_HEIGHT, height)
  }, 500)
}

export default new AppState()
