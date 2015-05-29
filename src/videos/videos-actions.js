import dispatcher from '../lib/dispatcher';
import videosService from './videos-service';

class VideosActions {
  didUpdateVideosData (videosData) {
    this.dispatch(videosData);
  }

  getVideosDataForPlaylist (playlistId, pageToken) {
    this.dispatch();

    videosService.getVideosDataForPlaylist(playlistId, pageToken).then((videosData) => {
      this.actions.didUpdateVideosData(videosData);
    });
  }

  getVideosDataForCustomPlaylist (id) {
    this.dispatch();

    videosService.getVideosDataForCustomPlaylist(id).then((videos) => {
      this.actions.didUpdateVideosData({ videos: videos, prevPageToken: null, nextPageToken: null });
    });
  }
}

export default dispatcher.createActions(VideosActions);
