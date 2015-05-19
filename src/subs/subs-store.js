import dispatcher from '../lib/dispatcher';
import actions from './subs-actions';

class SubStore {
  constructor () {
    this.subs = [];
    this.searchResults = [];

    this.bindListeners({
      updateSubs: actions.DID_UPDATE_SUBS,
      updateSeachResults: actions.DID_UPDATE_SEARCH_RESULTS
    });
  }

  updateSubs (subs) {
    this.subs = subs;
  }

  updateSeachResults (searchResults) {
    this.searchResults = searchResults;
  }
}

export default dispatcher.createStore(SubStore, 'SubStore');
