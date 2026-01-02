import {
  getVideosDataForChannelSearch,
  getVideosDataForPlaylist,
  getVideosDataForPlaylistSearch,
  getVideosDataForAllPlaylists,
  getVideos,
  getPlaylistsForChannel,
} from '../lib/youtube'

class VideosService {
  getVideosDataForPlaylist (playlistId, pageToken) {
    return getVideosDataForPlaylist(playlistId, pageToken)
  }

  getVideosDataForAllPlaylists (playlistIds) {
    return getVideosDataForAllPlaylists(playlistIds)
  }

  getVideosDataForChannelSearch (channelId, query, pageToken) {
    return getVideosDataForChannelSearch(channelId, query, pageToken)
  }

  getVideosDataForPlaylistSearch (playlistId, query) {
    return getVideosDataForPlaylistSearch(playlistId, query)
  }

  getVideosDataForCustomPlaylist (playlist) {
    if (!playlist.videos.size) return Promise.resolve([])

    return getVideos(playlist.videoIds)
  }

  getPlaylistsForChannel (channelId, pageToken) {
    return getPlaylistsForChannel(channelId, pageToken)
  }

  getVideo (id) {
    return getVideos([id]).then((videos) => {
      return videos[0]
    })
  }
}

export default new VideosService()
