import _ from 'lodash';
import Immutable from 'immutable';
import dispatcher from '../lib/dispatcher';
import actions from './videos-actions';

class VideosStore {
  constructor () {
    this.clearVideos();

    this.bindListeners({
      clearVideos: [
        actions.GET_VIDEOS_DATA_FOR_PLAYLIST,
        actions.GET_VIDEOS_DATA_FOR_CUSTOM_PLAYLIST
      ],
      updateVideosData: actions.DID_UPDATE_VIDEOS_DATA
    });
  }

  clearVideos () {
    this.videos = Immutable.List();
  }

  updateVideosData (data) {
    _.extend(this, data);
  }
}

export default dispatcher.createStore(VideosStore, 'VideosStore');
