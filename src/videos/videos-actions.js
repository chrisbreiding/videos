import dispatcher from '../lib/dispatcher';
import videosService from './videos-service';

class VideosActions {
  didUpdateVideosData (videosData) {
    this.dispatch(videosData);
  }

  getVideosForChannel (channelId, pageToken) {
    this.dispatch(channelId);

    videosService.getVideosForChannel(channelId, pageToken).then((videosData) => {
      this.actions.didUpdateVideosData(videosData);
    });
  }
}

export default dispatcher.createActions(VideosActions);
