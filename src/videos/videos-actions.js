import dispatcher from '../lib/dispatcher';
import videosService from './videos-service';

class VideosActions {
  didUpdateVideosData (videosData) {
    this.dispatch(videosData);
  }

  getVideosForPlaylist (playlistId, pageToken) {
    this.dispatch(playlistId);

    videosService.getVideosForPlaylist(playlistId, pageToken).then((videosData) => {
      this.actions.didUpdateVideosData(videosData);
    });
  }
}

export default dispatcher.createActions(VideosActions);
