import dispatcher from '../lib/dispatcher';
import videosService from './videos-service';

class VideosActions {
  didUpdateVideosData (videosData) {
    this.dispatch(videosData);
  }

  getVideosForChannel (channelId, pageToken) {
    videosService.getVideosForChannel(channelId, pageToken).then((videosData) => {
      videosData.channelId = channelId;
      this.actions.didUpdateVideosData(videosData);
    });
  }
}

export default dispatcher.createActions(VideosActions);
