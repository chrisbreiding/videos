import { action, computed, observable } from 'mobx'

const minNowPlayingHeight = 100
const maxNowPlayingHeightOffset = 10
const nowPlayingSizeRatio = 0.5625

class AppState {
  @observable _nowPlayingHeight = 540
  @observable windowHeight = window.innerHeight

  constructor () {
    window.addEventListener('resize', this._onWindowResize)
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
    this._nowPlayingHeight = height
  }
}

export default new AppState()
