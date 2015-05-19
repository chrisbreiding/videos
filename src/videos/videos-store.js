import dispatcher from '../lib/dispatcher';
import actions from './videos-actions';

class VideosStore {
  constructor () {
    this.videos = [];

    this.bindListeners({
      updateVideosData: actions.DID_UPDATE_VIDEOS_DATA
    });
  }

  updateVideosData ({ channelId, videos }) {
    this.channelId = channelId;
    this.videos = videos;
  }
}

export default dispatcher.createStore(VideosStore, 'VideosStore');
