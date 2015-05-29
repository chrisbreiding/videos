import { getVideosDataForPlaylist, getVideos } from '../lib/youtube';
import subsService from '../subs/subs-service';

class VideosService {
  getVideosDataForPlaylist (playlistId, pageToken) {
    return getVideosDataForPlaylist(playlistId, pageToken);
  }

  getVideosDataForCustomPlaylist (id) {
    return subsService.getSub(id).then(({ videos: ids }) => {
      return getVideos(ids);
    });
  }
};

export default new VideosService();
