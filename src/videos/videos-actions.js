import dispatcher from '../lib/dispatcher';
import videosService from './videos-service';

class VideosActions {
  didUpdateVideosData (videosData) {
    this.dispatch(videosData);
  }

  getVideosForChannel (channelId) {
    videosService.getVideosForChannel(channelId).then((videosData) => {
      videosData.channelId = channelId;
      this.actions.didUpdateVideosData(videosData);
    });
  }
}

export default dispatcher.createActions(VideosActions);
