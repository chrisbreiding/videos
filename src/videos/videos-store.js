import _ from 'lodash';
import dispatcher from '../lib/dispatcher';
import actions from './videos-actions';

class VideosStore {
  constructor () {
    this.clearVideos();

    this.bindListeners({
      clearVideos: actions.GET_VIDEOS_FOR_CHANNEL,
      updateVideosData: actions.DID_UPDATE_VIDEOS_DATA
    });
  }

  clearVideos (channelId) {
    this.channelId = channelId;
    this.videos = [];
  }

  updateVideosData (data) {
    _.extend(this, data);
  }
}

export default dispatcher.createStore(VideosStore, 'VideosStore');
