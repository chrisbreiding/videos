import {
  getVideosDataForChannelSearch,
  getVideosDataForPlaylist,
  getVideos,
} from '../lib/youtube';
import subsService from '../subs/subs-service';

class VideosService {
  getVideosDataForPlaylist (playlistId, pageToken) {
    return getVideosDataForPlaylist(playlistId, pageToken);
  }

  getVideosDataForChannelSearch (channelId, query, pageToken) {
    return getVideosDataForChannelSearch(channelId, query, pageToken);
  }

  getVideosDataForCustomPlaylist (id) {
    return subsService.getSub(id).then((sub) => {
      const ids = sub.get('videos')
        .toList()
        // .sortBy((video) => video.get('order')) TODO: ordering is borked
        .map((video) => video.get('id'))
        .toArray();
      return getVideos(ids)
    });
  }
}

export default new VideosService();
