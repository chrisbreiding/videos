import _ from 'lodash';
import { getVideosDataForPlaylist, getVideos } from '../lib/youtube';
import subsService from '../subs/subs-service';

class VideosService {
  getVideosDataForPlaylist (playlistId, pageToken) {
    return getVideosDataForPlaylist(playlistId, pageToken);
  }

  getVideosDataForCustomPlaylist (id) {
    return subsService.getSub(id).then((sub) => {
      const ids = sub.get('videos')
        .toList()
        .sortBy(video => video.get('order'))
        .map(video => video.get('id'))
        .toArray();
      return getVideos(ids);
    });
  }
};

export default new VideosService();
