import _ from 'lodash';
import dispatcher from '../lib/dispatcher';
import actions from './videos-actions';

class VideosStore {
  constructor () {
    this.videos = [];

    this.bindListeners({
      updateVideosData: actions.DID_UPDATE_VIDEOS_DATA
    });
  }

  updateVideosData (data) {
    _.extend(this, data);
  }
}

export default dispatcher.createStore(VideosStore, 'VideosStore');
