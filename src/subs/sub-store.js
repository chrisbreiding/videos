import dispatcher from '../lib/dispatcher';
import SubActions from './sub-actions'

class SubStore {
  constructor () {
    this.subs = [];

    this.bindListeners({
      onSubsUpdate: SubActions.UPDATE_SUBS
    });
  }

  onSubsUpdate (subs) {
    this.subs = subs;
  }
}

export default dispatcher.createStore(SubStore, 'SubStore');
