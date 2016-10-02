import _ from 'lodash'
import Immutable from 'immutable'
import dispatcher from '../lib/dispatcher'
import actions from './videos-actions'

class VideosStore {
  constructor () {
    this.videos = Immutable.List()

    this.bindListeners({
      updateLoadingVideos: actions.UPDATE_LOADING_VIDEOS,
      updateVideosData: actions.DID_UPDATE_VIDEOS_DATA,
    })
  }

  updateLoadingVideos (isLoading) {
    this.isLoading = isLoading
  }

  updateVideosData (data) {
    _.extend(this, data)
  }
}

export default dispatcher.createStore(VideosStore, 'VideosStore')
