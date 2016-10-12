import { action, observable } from 'mobx'
import _ from 'lodash'

import videosService from './videos-service'
import VideoModel from './video-model'

class VideosStore {
  @observable videos = []
  @observable isLoading = false
  @observable prevPageToken
  @observable nextPageToken

  getVideosDataForPlaylist (playlistId, pageToken) {
    this._beforeLoad()

    videosService.getVideosDataForPlaylist(playlistId, pageToken)
    .then(action('get:playlist:videos', (videosData) => {
      this._updateVideosData(videosData)
      this.isLoading = false
    }))
  }

  getVideosDataForChannelSearch (channel, query, pageToken) {
    this._beforeLoad()

    videosService.getVideosDataForChannelSearch(channel.id, query, pageToken)
    .then(action('get:channel:search:videos', (videosData) => {
      this._updateVideosData(videosData)
      this.isLoading = false
    }))
  }

  getVideosDataForCustomPlaylist (playlist) {
    this._beforeLoad()

    videosService.getVideosDataForCustomPlaylist(playlist)
    .then(action('get:custom:playlist:videos', (videos) => {
      this._updateVideosData({
        videos,
        prevPageToken: null,
        nextPageToken: null,
      })
      this.isLoading = false
    }))
  }

  _beforeLoad () {
    this.isLoading = true
    this.prevPageToken = null
    this.nextPageToken = null
  }

  _updateVideosData ({ videos, prevPageToken, nextPageToken }) {
    if (videos) this.videos = _.map(videos, (video) => new VideoModel(video))
    if (prevPageToken) this.prevPageToken = prevPageToken
    if (nextPageToken) this.nextPageToken = nextPageToken
  }
}

export default new VideosStore()
