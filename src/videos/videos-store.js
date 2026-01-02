import { action, computed, observable, values, toJS } from 'mobx'
import _ from 'lodash'
import moment from 'moment'
import arrayMove from 'array-move'

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
    if (this._isCustom) {
      return _.sortBy(values(this._videos), 'order')
    }

    const sortedVideos = this._videos.slice().sort((video1, video2) => {
      return moment(video1.published).isBefore(video2.published) ? 1 : -1
    })

    return _.take(sortedVideos, 25)
  }

  @action setHasLoadedAllPlaylists (hasLoaded) {
    this.hasLoadedAllPlaylists = hasLoaded
  }

  @action getVideosDataForPlaylist (playlistId, pageToken) {
    this._beforeLoad()

    return videosService.getVideosDataForPlaylist(playlistId, pageToken)
    .then((videosData) => {
      this._updateVideosData(videosData)
      this._afterLoad(false)
    })
  }

  @action getVideosDataForAllPlaylists (playlistIds) {
    if (!playlistIds.length) return Promise.resolve([])

    this._beforeLoad()

    return videosService.getVideosDataForAllPlaylists(playlistIds)
    .then((videos) => {
      this._updateVideosData({
        videos,
        prevPageToken: null,
        nextPageToken: null,
      })
      this.hasLoadedAllPlaylists = true
      this._afterLoad(false)
    })
  }

  @action getVideosDataForChannelSearch (channel, query, pageToken) {
    this._beforeLoad()

    return videosService.getVideosDataForChannelSearch(channel.id, query, pageToken)
    .then((videosData) => {
      this._updateVideosData(videosData)
      this._afterLoad(false)
    })
  }

  @action getVideosDataForPlaylistSearch (playlistId, query) {
    this._beforeLoad()

    return videosService.getVideosDataForPlaylistSearch(playlistId, query)
    .then((videosData) => {
      this._updateVideosData(videosData)
      this._afterLoad(false)
    })
  }

  @action getVideosDataForCustomPlaylist (playlist) {
    this._beforeLoad()

    return videosService.getVideosDataForCustomPlaylist(playlist)
    .then((videos) => {
      videos = _.map(videos, (video) => {
        return _.extend(video, toJS(playlist.videos)[video.id])
      })

      this._updateVideosData({
        videos,
        prevPageToken: null,
        nextPageToken: null,
      })
      this._afterLoad(true)
    })
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

  @action _beforeLoad () {
    this.isLoading = true
    this.prevPageToken = null
    this.nextPageToken = null
  }

  @action _afterLoad (isCustom) {
    this._isCustom = isCustom
    this.isLoading = false
  }

  @action _updateVideosData ({ videos, prevPageToken, nextPageToken }) {
    if (videos) this._videos = _.map(videos, (video) => new VideoModel(video))
    if (prevPageToken) this.prevPageToken = prevPageToken
    if (nextPageToken) this.nextPageToken = nextPageToken
  }

  sort ({ oldIndex, newIndex }) {
    if (oldIndex === newIndex) return false

    const ids = _.map(this.videos, 'id')
    const sortedIds = arrayMove(ids, oldIndex, newIndex)

    _.each(sortedIds, (id, order) => {
      this.getVideoById(id).update({ order })
    })

    return true
  }
}

export default new VideosStore()
