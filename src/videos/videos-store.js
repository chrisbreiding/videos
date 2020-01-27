import { action, computed, observable } from 'mobx'
import _ from 'lodash'
import moment from 'moment'
import RSVP from 'rsvp'

import videosService from './videos-service'
import VideoModel from './video-model'

class VideosStore {
  @observable _videos = []
  @observable _isCustom = false
  @observable hasLoadedAllPlaylists = false
  @observable isLoading = false
  @observable prevPageToken
  @observable nextPageToken

  @computed get videos () {
    const sortedVideos = this._videos.slice().sort((video1, video2) => {
      const method = this._isCustom ? 'isAfter' : 'isBefore'
      return moment(video1.published)[method](video2.published) ? 1 : -1
    })

    return _.take(sortedVideos, 25)
  }

  @action setHasLoadedAllPlaylists (hasLoaded) {
    this.hasLoadedAllPlaylists = hasLoaded
  }

  @action getVideosDataForPlaylist (playlistId, pageToken) {
    this._beforeLoad()

    return videosService.getVideosDataForPlaylist(playlistId, pageToken)
    .then(action('get:playlist:videos', (videosData) => {
      this._updateVideosData(videosData)
      this._afterLoad(false)
    }))
  }

  @action getVideosDataForAllPlaylists (playlistIds) {
    if (!playlistIds.length) return RSVP.Promise.resolve([])

    this._beforeLoad()

    return videosService.getVideosDataForAllPlaylists(playlistIds)
    .then(action('get:all:playlist:videos', (videos) => {
      this._updateVideosData({
        videos,
        prevPageToken: null,
        nextPageToken: null,
      })
      this.hasLoadedAllPlaylists = true
      this._afterLoad(false)
    }))
  }

  @action getVideosDataForChannelSearch (channel, query, pageToken) {
    this._beforeLoad()

    return videosService.getVideosDataForChannelSearch(channel.id, query, pageToken)
    .then(action('get:channel:search:videos', (videosData) => {
      this._updateVideosData(videosData)
      this._afterLoad(false)
    }))
  }

  @action getVideosDataForCustomPlaylist (playlist) {
    this._beforeLoad()

    return videosService.getVideosDataForCustomPlaylist(playlist)
    .then(action('get:custom:playlist:videos', (videos) => {
      this._updateVideosData({
        videos,
        prevPageToken: null,
        nextPageToken: null,
      })
      this._afterLoad(true)
    }))
  }

  getVideoById (id) {
    return _.find(this._videos, { id })
  }

  nextVideoId (videoId) {
    if (!videoId || this.videos.length < 2) return null

    const videoIndex = _.findIndex(this.videos, { id: videoId })
    if (videoIndex === -1) return null

    const nextVideo = this.videos[videoIndex + 1]
    if (!nextVideo) return null

    return nextVideo.id
  }

  _beforeLoad () {
    this.isLoading = true
    this.prevPageToken = null
    this.nextPageToken = null
  }

  _afterLoad (isCustom) {
    this._isCustom = isCustom
    this.isLoading = false
  }

  _updateVideosData ({ videos, prevPageToken, nextPageToken }) {
    if (videos) this._videos = _.map(videos, (video) => new VideoModel(video))
    if (prevPageToken) this.prevPageToken = prevPageToken
    if (nextPageToken) this.nextPageToken = nextPageToken
  }
}

export default new VideosStore()
