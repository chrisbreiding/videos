import dispatcher from '../lib/dispatcher'
import videosService from './videos-service'

class VideosActions {
  didUpdateVideosData (videosData) {
    this.dispatch(videosData)
  }

  getVideosDataForPlaylist (playlistId, pageToken) {
    this.actions.updateLoadingVideos(true)

    videosService.getVideosDataForPlaylist(playlistId, pageToken).then((videosData) => {
      this.actions.didUpdateVideosData(videosData)
      this.actions.updateLoadingVideos(false)
    })
  }

  getVideosDataForChannelSearch (channelId, query, pageToken) {
    this.actions.updateLoadingVideos(true)

    videosService.getVideosDataForChannelSearch(channelId, query, pageToken).then((videosData) => {
      this.actions.didUpdateVideosData(videosData)
      this.actions.updateLoadingVideos(false)
    })
  }

  getVideosDataForCustomPlaylist (id) {
    this.actions.updateLoadingVideos(true)

    videosService.getVideosDataForCustomPlaylist(id).then((videos) => {
      this.actions.didUpdateVideosData({
        videos,
        prevPageToken: null,
        nextPageToken: null,
      })
      this.actions.updateLoadingVideos(false)
    })
  }

  updateLoadingVideos (isLoading) {
    this.dispatch(isLoading)
  }
}

export default dispatcher.createActions(VideosActions)
