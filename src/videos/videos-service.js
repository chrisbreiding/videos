import { getVideosDataForPlaylist, getVideos } from '../lib/youtube';
import subsService from '../subs/subs-service';

export default {
  getVideosDataForPlaylist (playlistId, pageToken) {
    return getVideosDataForPlaylist(playlistId, pageToken);
  },

  getVideosDataForCustomPlaylist (id) {
    return subsService.getSub(id).then(({ videos: ids }) => {
      return getVideos(ids);
    });
  }
};
