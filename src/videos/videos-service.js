import RSVP from 'rsvp'
import {
  getVideosDataForChannelSearch,
  getVideosDataForPlaylist,
  getVideosDataForAllPlaylists,
  getVideos,
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

  getVideosDataForCustomPlaylist (playlist) {
    if (!playlist.videoIds.length) return RSVP.Promise.resolve([])

    return getVideos(playlist.videoIds)
  }
}

export default new VideosService()
