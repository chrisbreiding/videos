import { createStore } from '../lib/dispatcher';
import { UPDATE_SUBS } from './sub-actions'

class SubStore {
  constructor () {
    this.subs = [];

    this.bindListeners({
      onSubsUpdate: UPDATE_SUBS
    });
  }

  onSubsUpdate (subs) {
    this.subs = subs;
  }
}

export default createStore(SubStore, 'SubStore');
