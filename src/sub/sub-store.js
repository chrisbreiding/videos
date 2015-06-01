import _ from 'lodash';
import dispatcher from '../lib/dispatcher';
import actions from './sub-actions';

class SubStore {
  constructor () {
    this.sub = {};

    this.bindListeners({
      updateSub: actions.DID_UPDATE_SUB,
      setSubId: actions.GET_SUB
    });
  }

  setSubId (id) {
    this.id = id;
  }

  updateSub (sub) {
    this.sub = sub;
    if (sub.custom) {
      this.sub.videos = _(sub.videos)
        .values()
        .sortBy('order')
        .value();
    }
  }
}

export default dispatcher.createStore(SubStore, 'SubStore');
