import _ from 'lodash';
import Immutable from 'immutable';
import dispatcher from '../lib/dispatcher';
import actions from './sub-actions';

class SubStore {
  constructor () {
    this.sub = Immutable.Map();

    this.bindListeners({
      updateSub: actions.DID_UPDATE_SUB,
      setSubId: actions.GET_SUB
    });
  }

  setSubId (id) {
    this.id = id;
  }

  updateSub (sub) {
    this.sub = this.sub.merge(sub);
    if (sub.get('custom')) {
      const videos = sub.get('videos')
        .toList()
        .sortBy(video => video.get('order'));
      this.sub.set('videos', videos);
    }
  }
}

export default dispatcher.createStore(SubStore, 'SubStore');