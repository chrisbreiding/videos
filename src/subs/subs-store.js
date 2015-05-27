import _ from 'lodash';
import dispatcher from '../lib/dispatcher';
import actions from './subs-actions';

class SubStore {
  constructor () {
    this._subs = {};
    this.subs = [];
    this.searchResults = [];

    this.bindListeners({
      updateSubs: actions.DID_UPDATE_SUBS,
      addSub: actions.DID_ADD_SUB,
      removeSub: actions.DID_REMOVE_SUB,
      updateSeachResults: actions.DID_UPDATE_SEARCH_RESULTS
    });
  }

  updateSubs (subs = {}) {
    this._subs = subs;
    this._updateSubs();
  }

  addSub (sub) {
    this._subs[sub.id] = sub;
    this._updateSubs();
  }

  removeSub (id) {
    delete this._subs[id];
    this._updateSubs();
  }

  _updateSubs () {
    this.subs = _(this._subs)
      .values()
      .sortBy('order')
      .value();
  }

  updateSeachResults (searchResults) {
    this.searchResults = searchResults;
  }
}

export default dispatcher.createStore(SubStore, 'SubStore');
