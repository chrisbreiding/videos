import { getVideosForPlaylist } from '../lib/youtube';

export default {
  getVideosForPlaylist (playlistId, pageToken) {
    return getVideosForPlaylist(playlistId, pageToken);
  }
};
