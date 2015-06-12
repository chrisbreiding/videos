import _ from 'lodash';
import Immutable from 'immutable';
import dispatcher from '../lib/dispatcher';
import actions from './subs-actions';

class SubsStore {
  constructor () {
    this._subs = Immutable.Map();
    this.subs = Immutable.List();
    this.searchResults = Immutable.List();

    this.bindListeners({
      updateSubs: actions.DID_UPDATE_SUBS,
      addSub: actions.DID_ADD_SUB,
      removeSub: actions.DID_REMOVE_SUB,
      updateSeachResults: actions.DID_UPDATE_SEARCH_RESULTS
    });
  }

  updateSubs (subs = Immutable.Map()) {
    this._subs = this._subs.mergeDeep(subs);
    this._updateSubs();
  }

  addSub (sub) {
    this._subs = this._subs.set(sub.get('id'), sub);
    this._updateSubs();
  }

  removeSub (id) {
    this._subs = this._subs.remove(id);
    this._updateSubs();
  }

  _updateSubs () {
    this.subs = this._subs
      .toList()
      .sortBy(sub => sub.get('order'))
  }

  updateSeachResults (searchResults) {
    this.searchResults = searchResults;
  }
}

export default dispatcher.createStore(SubsStore, 'SubsStore');
