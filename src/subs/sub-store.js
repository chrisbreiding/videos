import dispatcher from '../lib/dispatcher';
import actions from './sub-actions'

class SubStore {
  constructor () {
    this.subs = [];

    this.bindListeners({
      updateSubs: actions.DID_UPDATE_SUBS
    });
  }

  updateSubs (subs) {
    this.subs = subs;
  }
}

export default dispatcher.createStore(SubStore, 'SubStore');
