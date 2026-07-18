import {
  getVideosDataForChannelSearch,
  getVideosDataForPlaylist,
  getVideosDataForPlaylistSearch,
  getVideosDataForAllPlaylists,
  getVideos,
  getPlaylistsForChannel,
} from '../lib/youtube'
import type { SubModel } from '../sub/sub-model'
import type { VideoData } from '../lib/types'

class VideosService {
  getVideosDataForPlaylist(playlistId: string, pageToken?: string | null) {
    return getVideosDataForPlaylist(playlistId, pageToken)
  }

  getVideosDataForAllPlaylists(playlistIds: string[]) {
    return getVideosDataForAllPlaylists(playlistIds)
  }

  getVideosDataForChannelSearch(
    channelId: string,
    query: string,
    pageToken?: string | null,
  ) {
    return getVideosDataForChannelSearch(channelId, query, pageToken)
  }

  getVideosDataForPlaylistSearch(playlistId: string, query: string) {
    return getVideosDataForPlaylistSearch(playlistId, query)
  }

  getVideosDataForCustomPlaylist(playlist: SubModel): Promise<VideoData[]> {
    if (!playlist.videos.size) return Promise.resolve([])

    return getVideos(playlist.videoIds)
  }

  getPlaylistsForChannel(channelId: string, pageToken?: string | null) {
    return getPlaylistsForChannel(channelId, pageToken)
  }

  async getVideo(id: string) {
    return (await getVideos([id]))[0]
  }
}

export const videosService = new VideosService()
